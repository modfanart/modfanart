import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('brand_verification_requests')
export class BrandVerificationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  user_id: string;

  @Column()
  company_name: string;

  @Column({ nullable: true })
  website: string;

  @Column()
  contact_email: string;

  @Column({ nullable: true })
  contact_phone: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', array: true, nullable: true })
  documents: string[];

  @Column({ default: 'pending' })
  status: string; // pending, approved, rejected, interview_scheduled

  @Column({ nullable: true })
  reviewed_by: string;

  @Column({ nullable: true })
  reviewed_at: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
