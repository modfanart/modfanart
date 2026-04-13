import { IsUUID, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class AddToCollectionDto {
  @IsUUID()
  @IsNotEmpty()
  artwork_id: string;

  @IsNumber()
  @IsOptional()
  sort_order?: number = 0;
}
