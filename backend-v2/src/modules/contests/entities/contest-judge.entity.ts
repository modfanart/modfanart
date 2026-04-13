import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Contest } from './contest.entity';
import { User } from '../../users/entities/user.entity';

@Entity('contest_judges')
export class ContestJudge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Contest, (contest) => contest.judges, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'contest_id' })
  contest: Contest;

  @Column()
  contest_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'judge_id' })
  judge: User;

  @Column()
  judge_id: string;

  @Column({ default: false })
  accepted: boolean;

  @Column({ nullable: true })
  invited_by: string;

  @CreateDateColumn()
  created_at: Date;
}
