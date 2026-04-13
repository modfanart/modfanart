import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class AddTagDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  tagName: string;

  @IsUUID()
  @IsOptional()
  tagId?: string; // If tag already exists
}
