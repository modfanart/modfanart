import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ArtworkCategory } from '../../artworks/entities/artwork-category.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @OneToMany(() => ArtworkCategory, (ac) => ac.category)
  artwork_categories: ArtworkCategory[];
}
