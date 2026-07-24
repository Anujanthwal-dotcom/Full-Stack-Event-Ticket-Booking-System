import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentException } from '../common/payment.exception';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(
      configService.get<string>('app.stripe.secretKey')!,
      { apiVersion: '2026-06-24.dahlia' as any },
    );
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    customerEmail: string,
  ) {
    return this.stripe.paymentIntents.create({
      amount,
      currency,
      receipt_email: customerEmail,
      automatic_payment_methods: { enabled: true },
    });
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async verifyPayment(
    paymentIntentId: string,
    expectedAmountCents: number,
    userEmail: string,
  ) {
    const pi = await this.retrievePaymentIntent(paymentIntentId);

    if (pi.status !== 'succeeded') {
      throw new PaymentException(
        `Payment not succeeded. Status: ${pi.status}`,
      );
    }

    if (pi.receipt_email !== userEmail) {
      throw new PaymentException('Receipt email does not match user email');
    }

    if (pi.amount !== expectedAmountCents) {
      throw new PaymentException(
        `Amount mismatch. Expected: ${expectedAmountCents}, got: ${pi.amount}`,
      );
    }

    return pi;
  }

  constructWebhookEvent(payload: Buffer, signature: string) {
    const webhookSecret = this.configService.get<string>(
      'app.stripe.webhookSecret',
    )!;
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }
}
