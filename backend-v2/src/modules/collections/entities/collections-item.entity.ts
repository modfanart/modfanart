import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Collection } from './collection.entity';
import { Artwork } from '../../artworks/entities/artwork.entity';

@Entity('collection_items')
export class CollectionItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Collection, (collection) => collection.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'collection_id' })
  collection: Collection;

  @Column()
  collection_id: string;

  @ManyToOne(() => Artwork, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artwork_id' })
  artwork: Artwork;

  @Column()
  artwork_id: string;

  @Column({ default: 0 })
  sort_order: number;

  @CreateDateColumn()
  added_at: Date;
}
