import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class BookTicketDto {
  @IsNumber()
  showId: number;

  @IsString()
  @IsNotEmpty()
  paymentIntentId: string;
}
