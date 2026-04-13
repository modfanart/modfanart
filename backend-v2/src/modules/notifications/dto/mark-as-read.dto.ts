import { IsUUID, IsOptional } from 'class-validator';

export class MarkAsReadDto {
  @IsUUID()
  @IsOptional()
  notificationId?: string; // if null → mark all as read
}
