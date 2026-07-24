import { IsNumber } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsNumber()
  showId: number;
}
