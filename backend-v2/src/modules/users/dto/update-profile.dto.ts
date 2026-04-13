import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsObject()
  @IsOptional()
  profile?: Record<string, any>;
}
