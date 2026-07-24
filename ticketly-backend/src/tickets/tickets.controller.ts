import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  Res,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { TicketsService } from './tickets.service';
import { BookTicketDto } from './dto/book-ticket.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/tickets')
@UseGuards(AuthGuard)
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Get()
  getUserTickets(@Req() req: Request) {
    const userId = (req as any).session?.passport?.user;
    return this.ticketsService.getUserTickets(userId);
  }

  @Get(':id')
  getTicketById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const userId = (req as any).session?.passport?.user;
    return this.ticketsService.getTicketById(id, userId);
  }

  @Post()
  async bookTicket(@Body() dto: BookTicketDto, @Req() req: Request) {
    const userId = (req as any).session?.passport?.user;
    return this.ticketsService.bookTicketWithPdf(dto, userId);
  }

  @Get(':id/download')
  async downloadTicketPdf(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userId = (req as any).session?.passport?.user;
    const pdfBuffer = await this.ticketsService.downloadTicketPdf(id, userId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ticket-${id}.pdf"`,
    });
    res.send(pdfBuffer);
  }
}
