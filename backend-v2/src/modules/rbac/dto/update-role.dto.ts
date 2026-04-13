import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';
import {
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
  IsObject,
} from 'class-validator';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  hierarchy_level?: number;

  @IsObject()
  @IsOptional()
  permissions?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  is_system?: boolean;
}
