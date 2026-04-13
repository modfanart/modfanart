import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ArtworkPricingTier } from './artwork-pricing-tier.entity';
import { ArtworkCategory } from './artwork-category.entity';

@Entity('artworks')
export class Artwork {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column()
  file_url: string;

  @Column({ nullable: true })
  thumbnail_url: string;

  @Column({ nullable: true })
  source_file_url: string;

  @Column({ default: 'draft' })
  status: string; // draft, published, archived

  @Column({ default: 'pending' })
  moderation_status: string;

  @Column({ default: 0 })
  views_count: number;

  @Column({ default: 0 })
  favorites_count: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column()
  creator_id: string;

  @OneToMany(() => ArtworkPricingTier, (tier) => tier.artwork, {
    cascade: true,
  })
  pricing_tiers: ArtworkPricingTier[];

  @OneToMany(() => ArtworkCategory, (ac) => ac.artwork)
  artwork_categories: ArtworkCategory[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  deleted_at: Date;
}
