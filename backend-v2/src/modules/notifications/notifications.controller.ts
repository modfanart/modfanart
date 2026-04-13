import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { MarkAsReadDto } from './dto/mark-as-read.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Admin / System use only (or internal service call)
  @Post()
  async create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getRecent(@Req() req, @Query('limit') limit = 50) {
    return this.notificationsService.getRecent(req.user.id, +limit);
  }

  @Get('unread')
  @UseGuards(JwtAuthGuard)
  async getUnread(@Req() req, @Query('limit') limit = 20) {
    return this.notificationsService.getUnread(req.user.id, +limit);
  }

  @Patch('read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Req() req, @Body() dto: MarkAsReadDto) {
    if (dto.notificationId) {
      return this.notificationsService.markAsRead(dto.notificationId);
    }
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markSingleAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}
