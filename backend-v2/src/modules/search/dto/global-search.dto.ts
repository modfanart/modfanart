import {
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  IsNumber,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class GlobalSearchDto {
  @IsString()
  @MinLength(2)
  q: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 20;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  offset?: number = 0;

  @IsOptional()
  @IsIn(['artwork', 'user', 'brand', 'contest', 'category', 'tag'], {
    each: true,
  })
  type?: string[]; // comma-separated in query string, transformed to array
}
