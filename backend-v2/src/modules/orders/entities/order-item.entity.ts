import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Artwork } from '../../artworks/entities/artwork.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column()
  order_id: string;

  @ManyToOne(() => Artwork, { nullable: true })
  @JoinColumn({ name: 'artwork_id' })
  artwork: Artwork;

  @Column({ nullable: true })
  artwork_id: string;

  @Column()
  license_type: string;

  @Column({ type: 'bigint' })
  unit_price_cents: number;

  @Column({ default: 1 })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  created_at: Date;
}
