import { Module, forwardRef } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ShowsModule } from '../shows/shows.module';
import { TicketsModule } from '../tickets/tickets.module';

@Module({
  imports: [
    ShowsModule,
    forwardRef(() => TicketsModule),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
