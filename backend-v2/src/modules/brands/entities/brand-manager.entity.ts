import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Brand } from './brand.entity';
import { User } from '../../users/entities/user.entity';

@Entity('brand_managers')
export class BrandManager {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Brand, (brand) => brand.managers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @Column()
  brand_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @Column({ default: 'manager' })
  role: string; // owner, manager, editor

  @CreateDateColumn()
  created_at: Date;
}
