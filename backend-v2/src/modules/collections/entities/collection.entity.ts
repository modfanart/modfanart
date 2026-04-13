import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CollectionItem } from './collections-item.entity';
@Entity('collections')
export class Collection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  owner_type: string; // 'user' or 'brand'

  @Column()
  owner_id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  is_public: boolean;

  @Column({ nullable: true })
  cover_image_url: string;

  @Column({ default: 0 })
  sort_order: number;

  @Column({ nullable: true })
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ─── New Relation ───
  @OneToMany(() => CollectionItem, (item) => item.collection)
  items: CollectionItem[];
}
