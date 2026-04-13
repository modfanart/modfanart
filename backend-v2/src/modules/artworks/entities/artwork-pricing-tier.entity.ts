import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Artwork } from './artwork.entity';

@Entity('artwork_pricing_tiers')
export class ArtworkPricingTier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Artwork, (artwork) => artwork.pricing_tiers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'artwork_id' })
  artwork: Artwork;

  @Column()
  artwork_id: string;

  @Column()
  license_type: string; // personal, commercial, exclusive

  @Column({ type: 'bigint', default: 0 })
  price_inr_cents: number;

  @Column({ type: 'bigint', default: 0 })
  price_usd_cents: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;
}
