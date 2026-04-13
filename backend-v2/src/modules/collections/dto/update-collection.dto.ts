import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateCollectionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  is_public?: boolean;

  @IsString()
  @IsOptional()
  cover_image_url?: string;

  @IsOptional()
  sort_order?: number;
}
