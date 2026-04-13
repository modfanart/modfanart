import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('licenses')
export class License {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  order_item_id: string;

  @Column()
  artwork_id: string;

  @Column()
  buyer_id: string;

  @Column()
  seller_id: string;

  @Column()
  license_type: string; // personal, commercial, exclusive

  @Column({ nullable: true })
  contract_pdf_url: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  revoked_at: Date;

  @Column({ nullable: true })
  revoked_by: string;

  @Column({ nullable: true })
  expires_at: Date; // null = perpetual

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
