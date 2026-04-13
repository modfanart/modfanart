import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  token_hash: string;

  @Column()
  expires_at: Date;

  @Column({ nullable: true })
  revoked_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
