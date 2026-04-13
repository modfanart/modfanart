import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Tag } from './tag.entity';

@Entity('taggings')
export class Tagging {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tag, (tag) => tag.taggings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;

  @Column()
  tag_id: string;

  @Column()
  taggable_type: string; // 'artwork', 'brand', 'contest', etc.

  @Column()
  taggable_id: string;

  @Column()
  created_by: string;

  @CreateDateColumn()
  created_at: Date;
}
