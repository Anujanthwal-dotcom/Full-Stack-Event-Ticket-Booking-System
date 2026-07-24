import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ShowsService } from '../shows/shows.service';
import { TicketsService } from '../tickets/tickets.service';
import { PrismaService } from '../prisma/prisma.service';
import { RateLimit } from '../rate-limit/rate-limit.decorator';

@Controller('api/payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private showsService: ShowsService,
    private ticketsService: TicketsService,
    private prisma: PrismaService,
  ) {}

  @Post('create-intent')
  @UseGuards(AuthGuard)
  @RateLimit(60_000, 5)
  async createIntent(
    @Body() dto: CreatePaymentIntentDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).session?.passport?.user;
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const show = await this.showsService.getShowById(dto.showId);
    const amountInCents = Math.round(show.price * 100);

    const paymentIntent = await this.paymentsService.createPaymentIntent(
      amountInCents,
      'usd',
      user.email,
    );

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(@Req() req: Request, @Res() res: Response) {
    const signature = req.headers['stripe-signature'] as string;

    let event: any;
    try {
      event = this.paymentsService.constructWebhookEvent(
        (req as any).rawBody,
        signature,
      );
    } catch (err: any) {
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.ticketsService.handleSucceededPayment(
          event.data.object.id,
        );
        break;
      case 'payment_intent.payment_failed':
        await this.ticketsService.handleFailedPayment(
          event.data.object.id,
        );
        break;
      case 'charge.refunded':
        await this.ticketsService.handleRefund(
          event.data.object.payment_intent,
        );
        break;
    }

    return res.json({ received: true });
  }
}
