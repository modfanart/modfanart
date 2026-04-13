import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PricingTierDto {
  @IsEnum(['personal', 'commercial', 'exclusive'])
  license_type: string;

  @IsOptional()
  price_inr_cents?: number;

  @IsOptional()
  price_usd_cents?: number;
}

export class CreateArtworkDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  category_ids?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingTierDto)
  @IsOptional()
  pricing_tiers?: PricingTierDto[];
}
