import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { CreateNotificationDto } from '../dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  async create(dto: CreateNotificationDto) {
    const notification = this.notificationRepo.create(dto);
    return this.notificationRepo.save(notification);
  }

  async markAsRead(notificationId: string) {
    const result = await this.notificationRepo.update(
      { id: notificationId, read_at: null },
      { read_at: new Date() },
    );

    if (result.affected === 0) {
      throw new NotFoundException('Notification not found or already read');
    }
    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepo.update(
      { user_id: userId, read_at: null },
      { read_at: new Date() },
    );
    return { message: 'All notifications marked as read' };
  }

  async getUnread(userId: string, limit = 20) {
    return this.notificationRepo.find({
      where: { user_id: userId, read_at: null },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async getRecent(userId: string, limit = 50) {
    return this.notificationRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async getById(id: string) {
    const notification = await this.notificationRepo.findOne({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }
}
