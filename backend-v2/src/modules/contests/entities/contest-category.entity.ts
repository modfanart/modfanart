import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Contest } from './contest.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('contest_categories')
export class ContestCategory {
  @PrimaryColumn()
  contest_id: string;

  @PrimaryColumn()
  category_id: string;

  @ManyToOne(() => Contest, (contest) => contest.contest_categories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'contest_id' })
  contest: Contest;

  @ManyToOne(() => Category, (category) => category.contest_categories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @CreateDateColumn()
  created_at: Date;
}
