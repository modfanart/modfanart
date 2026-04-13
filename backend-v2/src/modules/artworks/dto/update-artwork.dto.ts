import { IsString, IsOptional } from 'class-validator';

export class UpdateArtworkDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
