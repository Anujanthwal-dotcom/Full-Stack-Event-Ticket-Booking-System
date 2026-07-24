import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsPositive,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateShowDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsNotEmpty()
  showDateTime: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  venue: string;

  @IsInt()
  @IsPositive()
  totalSeats: number;

  @IsNumber()
  @Min(0.01)
  price: number;
}
