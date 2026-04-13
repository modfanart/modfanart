import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ContestEntry } from './contest-entry.entity';
import { User } from '../../users/entities/user.entity';

@Entity('contest_judge_scores')
export class ContestJudgeScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ContestEntry, (entry) => entry.judge_scores, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'entry_id' })
  entry: ContestEntry;

  @Column()
  entry_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'judge_id' })
  judge: User;

  @Column()
  judge_id: string;

  @Column({ type: 'int' })
  score: number; // 0-100

  @Column({ type: 'text', nullable: true })
  comments: string;

  @CreateDateColumn()
  created_at: Date;
}
