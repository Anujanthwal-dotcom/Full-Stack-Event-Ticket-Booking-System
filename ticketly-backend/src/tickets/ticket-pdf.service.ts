import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class TicketPdfService {
  generateTicketPdf(ticket: any, show: any, user: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A5',
        margin: 40,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const purple = '#4F46E5';

      doc
        .fontSize(22)
        .fillColor(purple)
        .font('Helvetica-Bold')
        .text('TICKETLY', { align: 'center' });

      doc.moveDown(0.5);

      doc
        .fontSize(10)
        .fillColor('#888888')
        .font('Helvetica')
        .text('Booking Confirmation', { align: 'center' });

      doc.moveDown(1);
      doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#e5e7eb').stroke();

      doc.moveDown(0.5);

      const date = new Date(show.showDateTime);
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const addRow = (label: string, value: string) => {
        doc
          .fontSize(9)
          .fillColor('#888888')
          .font('Helvetica')
          .text(label, 50, doc.y, { continued: true })
          .fillColor('#1f2937')
          .font('Helvetica-Bold')
          .text(`  ${value}`);
        doc.moveDown(0.3);
      };

      addRow('Show:', show.title);
      addRow('Date:', dateStr);
      addRow('Time:', timeStr);
      addRow('Venue:', show.venue);
      addRow('Seat:', `#${ticket.seatNumber}`);
      addRow('Ticket ID:', `#${ticket.id}`);
      addRow('Name:', user.name);
      addRow('Email:', user.email);

      doc.moveDown(0.5);
      doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#e5e7eb').stroke();

      doc.moveDown(1);

      doc
        .fontSize(8)
        .fillColor('#888888')
        .font('Helvetica')
        .text('Thank you for choosing Ticketly!', { align: 'center' });

      doc.end();
    });
  }
}
