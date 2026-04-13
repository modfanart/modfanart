import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsObject,
} from 'class-validator';

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsInt()
  hierarchy_level: number;

  @IsObject()
  @IsOptional()
  permissions?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  is_system?: boolean;
}
