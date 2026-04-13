import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BrandPost } from './brand-post.entity';
import { User } from '../../users/entities/user.entity';

@Entity('brand_post_comments')
export class BrandPostComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BrandPost, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: BrandPost;

  @Column()
  post_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @Column({ nullable: true })
  parent_id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: 0 })
  likes_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  deleted_at: Date;
}
