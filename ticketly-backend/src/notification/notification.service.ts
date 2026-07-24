import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: configService.get<string>('app.mail.host'),
      port: configService.get<number>('app.mail.port'),
      auth: {
        user: configService.get<string>('app.mail.username'),
        pass: configService.get<string>('app.mail.password'),
      },
    });
  }

  async sendBookingConfirmation(
    to: string,
    showTitle: string,
    seatNumber: string,
    dateTime: string,
    venue: string,
    pdfBuffer: Buffer,
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Booking Confirmation</h2>
        <p>Your ticket has been booked successfully!</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; font-weight: bold;">Show</td><td style="padding: 8px;">${showTitle}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Date & Time</td><td style="padding: 8px;">${dateTime}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Venue</td><td style="padding: 8px;">${venue}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Seat</td><td style="padding: 8px;">${seatNumber}</td></tr>
        </table>
        <p>Please find your ticket PDF attached.</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.configService.get<string>('app.mail.from'),
      to,
      subject: `Booking Confirmed - ${showTitle}`,
      html,
      attachments: [
        {
          filename: 'ticket.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }
}
