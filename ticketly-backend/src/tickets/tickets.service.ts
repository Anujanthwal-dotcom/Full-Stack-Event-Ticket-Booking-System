import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookTicketDto } from './dto/book-ticket.dto';
import { toTicketResponse, TicketResponse } from './dto/ticket-response';
import { TicketPdfService } from './ticket-pdf.service';
import { S3Service } from '../storage/s3.service';
import { NotificationService } from '../notification/notification.service';
import { PaymentsService } from '../payments/payments.service';
import { EntityNotFoundException } from '../common/entity-not-found.exception';
import { AccessDeniedException } from '../common/access-denied.exception';
import { SeatUnavailableException } from '../common/seat-unavailable.exception';
import { PaymentException } from '../common/payment.exception';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private ticketPdfService: TicketPdfService,
    private s3Service: S3Service,
    private notificationService: NotificationService,
    private paymentsService: PaymentsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getUserTickets(userId: number): Promise<TicketResponse[]> {
    const tickets = await this.prisma.ticket.findMany({
      where: { userId },
      include: { show: true },
      orderBy: { bookedAt: 'desc' },
    });

    return tickets.map(toTicketResponse);
  }

  async getTicketById(id: number, userId: number): Promise<TicketResponse> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { show: true },
    });

    if (!ticket) {
      throw new EntityNotFoundException(`Ticket with ID ${id} not found`);
    }

    if (ticket.userId !== userId) {
      throw new AccessDeniedException('You are not authorized to view this ticket');
    }

    return toTicketResponse(ticket);
  }

  async bookTicket(
    dto: BookTicketDto,
    userId: number,
  ): Promise<TicketResponse> {
    const existingTicket = await this.prisma.ticket.findUnique({
      where: { paymentIntentId: dto.paymentIntentId },
    });

    if (existingTicket) {
      throw new PaymentException('This payment has already been used');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const show = await tx.$queryRaw<any[]>`
        SELECT * FROM shows WHERE id = ${dto.showId} FOR UPDATE
      `;
      const showRow = show[0];

      if (!showRow) {
        throw new EntityNotFoundException(`Show with ID ${dto.showId} not found`);
      }

      if (showRow.availableSeats <= 0) {
        throw new SeatUnavailableException('No seats available for this show');
      }

      const expectedAmountCents = Math.round(Number(showRow.price) * 100);
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new EntityNotFoundException('User not found');
      }

      await this.paymentsService.verifyPayment(
        dto.paymentIntentId,
        expectedAmountCents,
        user.email,
      );

      const ticket = await tx.ticket.create({
        data: {
          showId: dto.showId,
          userId,
          seatNumber: showRow.totalSeats - showRow.availableSeats + 1,
          paymentIntentId: dto.paymentIntentId,
          status: 'BOOKED',
        },
        include: { show: true },
      });

      await tx.show.update({
        where: { id: dto.showId },
        data: { availableSeats: { decrement: 1 } },
      });

      return ticket;
    });

    await this.cacheManager.del(`show:${dto.showId}`);
    return toTicketResponse(result);
  }

  async bookTicketWithPdf(
    dto: BookTicketDto,
    userId: number,
  ): Promise<TicketResponse> {
    const ticketResponse = await this.bookTicket(dto, userId);

    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketResponse.id },
      include: { show: true, user: true },
    });

    if (!ticket) {
      return ticketResponse;
    }

    try {
      const pdfBuffer = await this.ticketPdfService.generateTicketPdf(
        ticket,
        ticket.show,
        ticket.user,
      );

      const s3Key = `tickets/${ticket.id}.pdf`;
      await this.s3Service.uploadPdf(s3Key, pdfBuffer);

      await this.prisma.ticket.update({
        where: { id: ticket.id },
        data: { ticketPdfUrl: s3Key },
      });

      ticketResponse.showId = ticketResponse.showId;

      const showDateTime = new Date(ticket.show.showDateTime);
      this.notificationService
        .sendBookingConfirmation(
          ticket.user.email,
          ticket.show.title,
          String(ticket.seatNumber),
          `${showDateTime.toLocaleDateString()} ${showDateTime.toLocaleTimeString()}`,
          ticket.show.venue,
          pdfBuffer,
        )
        .catch((err: any) => console.error('Failed to send email:', err));
    } catch (err: any) {
      console.error('Error generating/uploading PDF:', err);
    }

    const freshTicket = await this.prisma.ticket.findUnique({
      where: { id: ticketResponse.id },
      include: { show: true },
    });

    return freshTicket ? toTicketResponse(freshTicket) : ticketResponse;
  }

  async handleSucceededPayment(paymentIntentId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { paymentIntentId },
    });
    if (ticket) {
      console.log(`Payment succeeded for ticket ${ticket.id}`);
    }
  }

  async handleFailedPayment(paymentIntentId: string) {
    await this.prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.findUnique({
        where: { paymentIntentId },
      });

      if (ticket && ticket.status !== 'CANCELLED') {
        await tx.ticket.update({
          where: { id: ticket.id },
          data: { status: 'CANCELLED' },
        });

        await tx.show.update({
          where: { id: ticket.showId },
          data: { availableSeats: { increment: 1 } },
        });
      }
    });
  }

  async handleRefund(paymentIntentId: string) {
    return this.handleFailedPayment(paymentIntentId);
  }

  async downloadTicketPdf(
    ticketId: number,
    userId: number,
  ): Promise<Buffer> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new EntityNotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    if (ticket.userId !== userId) {
      throw new AccessDeniedException('You are not authorized to download this ticket');
    }

    if (!ticket.ticketPdfUrl) {
      throw new EntityNotFoundException('Ticket PDF not available');
    }

    return this.s3Service.downloadPdf(ticket.ticketPdfUrl);
  }
}
