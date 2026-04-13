import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  order_number: string;

  @Column()
  buyer_id: string;

  @Column()
  seller_id: string;

  @Column()
  source_type: string; // 'license_purchase', 'contest_prize', etc.

  @Column({ nullable: true })
  source_id: string;

  @Column({ default: 'pending' })
  status: string; // pending, paid, failed, cancelled, fulfilled

  @Column()
  currency: string;

  @Column({ type: 'bigint' })
  subtotal_cents: number;

  @Column({ type: 'bigint', default: 0 })
  platform_fee_cents: number;

  @Column({ type: 'bigint', default: 0 })
  tax_cents: number;

  @Column({ type: 'bigint' })
  total_cents: number;

  @Column({ nullable: true })
  stripe_payment_intent_id: string;

  @Column({ nullable: true })
  stripe_charge_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];
}
