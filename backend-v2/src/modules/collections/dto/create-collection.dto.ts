import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateCollectionDto {
  @IsEnum(['user', 'brand'])
  @IsNotEmpty()
  owner_type: string;

  @IsUUID()
  @IsNotEmpty()
  owner_id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  is_public?: boolean = true;

  @IsString()
  @IsOptional()
  cover_image_url?: string;
}
