import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsString()
  courseId: string;

  @IsOptional()
  @IsString()
  promoCode?: string;
}

