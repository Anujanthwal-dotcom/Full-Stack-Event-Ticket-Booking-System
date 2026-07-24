import { Module, forwardRef } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TicketPdfService } from './ticket-pdf.service';
import { StorageModule } from '../storage/storage.module';
import { NotificationModule } from '../notification/notification.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    StorageModule,
    NotificationModule,
    forwardRef(() => PaymentsModule),
  ],
  controllers: [TicketsController],
  providers: [TicketsService, TicketPdfService],
  exports: [TicketsService],
})
export class TicketsModule {}
