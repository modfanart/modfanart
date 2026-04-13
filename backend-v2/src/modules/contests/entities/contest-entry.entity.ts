import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Contest } from './contest.entity';
import { Artwork } from '../../artworks/entities/artwork.entity';
import { User } from '../../users/entities/user.entity';

@Entity('contest_entries')
export class ContestEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Contest, (contest) => contest.entries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'contest_id' })
  contest: Contest;

  @Column()
  contest_id: string;

  @ManyToOne(() => Artwork, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artwork_id' })
  artwork: Artwork;

  @Column()
  artwork_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column()
  creator_id: string;

  @Column({ type: 'text', nullable: true })
  submission_notes: string;

  @Column({ default: 'pending' })
  status: string; // pending, approved, rejected, disqualified, winner

  @Column({ default: 'pending' })
  moderation_status: string;

  @Column({ type: 'int', default: 0 })
  score_public: number; // from community votes

  @Column({ type: 'int', default: 0 })
  score_judge: number; // average from judges

  @Column({ nullable: true })
  rank: number;

  @Column({ nullable: true })
  moderated_by: string;

  @Column({ nullable: true })
  moderated_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  deleted_at: Date;
}
