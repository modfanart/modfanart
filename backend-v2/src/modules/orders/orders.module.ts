import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { License } from './entities/license.entity';
import { StripeService } from 'src/common/services/stripe.service';
@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, License])],
  controllers: [OrdersController],
  providers: [OrdersService, StripeService],
  exports: [OrdersService],
})
export class OrdersModule {}
