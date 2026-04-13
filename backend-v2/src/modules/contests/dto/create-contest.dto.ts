import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsOptional,
  IsArray,
  IsNumber,
  IsObject,
} from 'class-validator';

export class CreateContestDto {
  @IsString()
  @IsNotEmpty()
  brand_id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  rules?: string;

  @IsArray()
  @IsOptional()
  prizes?: any[];

  @IsDateString()
  start_date: string;

  @IsDateString()
  submission_end_date: string;

  @IsEnum(['public', 'private'])
  @IsOptional()
  visibility?: string = 'public';

  @IsEnum(['draft', 'published', 'live'])
  @IsOptional()
  status?: string = 'draft';

  @IsNumber()
  @IsOptional()
  max_entries_per_user?: number = 1;

  @IsArray()
  @IsOptional()
  categoryIds?: string[];
}
