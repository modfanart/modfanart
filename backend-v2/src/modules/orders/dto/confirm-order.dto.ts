import { IsString, IsNotEmpty } from 'class-validator';

export class ConfirmOrderDto {
  @IsString()
  @IsNotEmpty()
  paymentIntentId: string;
}
