import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  @IsNotEmpty()
  artwork_id: string;

  @IsString()
  @IsNotEmpty()
  pricing_tier_id: string;
}
