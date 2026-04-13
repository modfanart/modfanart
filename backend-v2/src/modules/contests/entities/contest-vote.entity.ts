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

@Entity('contest_votes')
export class ContestVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ContestEntry, (entry) => entry.votes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'entry_id' })
  entry: ContestEntry;

  @Column()
  entry_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @Column({ default: 1 })
  vote_weight: number;

  @CreateDateColumn()
  created_at: Date;
}
