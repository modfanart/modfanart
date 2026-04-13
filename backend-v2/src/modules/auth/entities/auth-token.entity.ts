import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('auth_tokens')
export class AuthToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  type: string; // 'email_verification' | 'password_reset'

  @Column()
  token_hash: string;

  @Column()
  expires_at: Date;

  @Column({ nullable: true })
  used_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
