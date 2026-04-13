import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Artwork } from './artwork.entity';
import { Category } from '../../categories/entities/category.entity'; // We'll create this

@Entity('artwork_categories')
export class ArtworkCategory {
  @PrimaryColumn()
  artwork_id: string;

  @PrimaryColumn()
  category_id: string;

  @ManyToOne(() => Artwork, (artwork) => artwork.artwork_categories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'artwork_id' })
  artwork: Artwork;

  @ManyToOne(() => Category, (category) => category.artwork_categories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
