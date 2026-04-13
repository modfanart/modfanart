import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Brand } from './brand.entity';
import { Artwork } from '../../artworks/entities/artwork.entity';

@Entity('brand_artworks')
export class BrandArtwork {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Brand, (brand) => brand.brand_artworks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @Column()
  brand_id: string;

  @ManyToOne(() => Artwork, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artwork_id' })
  artwork: Artwork;

  @Column()
  artwork_id: string;

  @Column({ default: false })
  is_featured: boolean;

  @Column({ default: 0 })
  sort_order: number;

  @CreateDateColumn()
  added_at: Date;
}
