import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Brand } from '../../brands/entities/brand.entity';

@Entity('contests')
export class Contest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Brand, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @Column()
  brand_id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  rules: string;

  @Column({ type: 'jsonb', nullable: true })
  prizes: any[];

  @Column({ type: 'jsonb', nullable: true })
  entry_requirements: any;

  @Column({ type: 'jsonb', nullable: true })
  judging_criteria: any;

  @Column()
  start_date: Date;

  @Column()
  submission_end_date: Date;

  @Column({ nullable: true })
  voting_end_date: Date;

  @Column({ nullable: true })
  judging_end_date: Date;

  @Column({ default: 'draft' })
  status: string; // draft, published, live, judging, completed, archived

  @Column({ default: 'public' })
  visibility: string;

  @Column({ default: 1 })
  max_entries_per_user: number;

  @Column({ default: false })
  winner_announced: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  deleted_at: Date;
  @OneToMany(() => ContestCategory, (cc) => cc.contest)
  contest_categories: ContestCategory[];

  @OneToMany(() => ContestEntry, (ce) => ce.contest)
  entries: ContestEntry[];

  @OneToMany(() => ContestJudge, (cj) => cj.contest)
  judges: ContestJudge[];
}
