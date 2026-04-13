import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findAll() {
    return this.roleRepository.find({
      order: { hierarchy_level: 'DESC', name: 'ASC' },
    });
  }

  async findById(id: string) {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async findByName(name: string) {
    return this.roleRepository.findOne({ where: { name } });
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.findByName(dto.name);
    if (existing) throw new ConflictException('Role name already exists');

    const role = this.roleRepository.create(dto);
    return this.roleRepository.save(role);
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.findById(id);
    if (role.is_system && dto.is_system === false) {
      throw new ConflictException('Cannot change system role flag');
    }

    Object.assign(role, dto);
    return this.roleRepository.save(role);
  }

  async remove(id: string) {
    const role = await this.findById(id);
    if (role.is_system)
      throw new ConflictException('Cannot delete system role');

    const userCount = await this.roleRepository
      .createQueryBuilder()
      .relation(Role, 'users')
      .of(role.id)
      .loadCount();

    if (userCount > 0)
      throw new ConflictException('Cannot delete role - users are assigned');

    await this.roleRepository.delete(id);
  }
}
