import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Brand } from './brand.entity';

@Entity('brand_posts')
export class BrandPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Brand, (brand) => brand.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @Column()
  brand_id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'text', array: true, nullable: true })
  media_urls: string[];

  @Column({ default: 'draft' })
  status: string;

  @Column({ default: false })
  is_pinned: boolean;

  @Column({ default: 0 })
  likes_count: number;

  @Column({ default: 0 })
  comments_count: number;

  @Column({ default: 0 })
  upvotes_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  deleted_at: Date;
}
