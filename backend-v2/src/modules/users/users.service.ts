import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id, deleted_at: null },
      relations: ['role'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByUsername(username: string) {
    return this.userRepository.findOne({
      where: {
        username: username.toLowerCase(),
        status: 'active',
        deleted_at: null,
      },
      relations: ['role'],
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.findById(userId);
    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    return this.userRepository.update(userId, {
      avatar_url: avatarUrl,
      updated_at: new Date(),
    });
  }

  // Add more methods: changePassword, softDelete, etc.
}
