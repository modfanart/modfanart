import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  type: string; // e.g., 'new_follower', 'like', 'comment', 'contest_won', 'license_purchased', etc.

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  data: Record<string, any>; // metadata like { artwork_id, contest_id, etc. }

  @Column({ nullable: true })
  read_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
