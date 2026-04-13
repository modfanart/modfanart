import { IsString, IsNotEmpty } from 'class-validator';

export class ToggleFavoriteDto {
  @IsString()
  @IsNotEmpty()
  favoritable_type: string; // default 'artwork'
}
