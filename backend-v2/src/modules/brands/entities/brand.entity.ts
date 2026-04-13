import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BrandManager } from './brand-manager.entity';
import { BrandArtwork } from './brand-artwork.entity';
import { BrandPost } from './brand-post.entity';

@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column({ nullable: true })
  banner_url: string;

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  social_links: Record<string, string>;

  @Column({ default: 'pending' })
  status: string; // pending, active, rejected, deactivated

  @Column({ default: 0 })
  followers_count: number;

  @Column({ default: 0 })
  views_count: number;

  @Column({ nullable: true })
  verification_request_id: string;

  @Column({ nullable: true })
  user_id: string; // legacy owner

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  owner: User;

  @OneToMany(() => BrandManager, (bm) => bm.brand)
  managers: BrandManager[];

  @OneToMany(() => BrandArtwork, (ba) => ba.brand)
  brand_artworks: BrandArtwork[];

  @OneToMany(() => BrandPost, (bp) => bp.brand)
  posts: BrandPost[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  deleted_at: Date;
}
