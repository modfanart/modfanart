import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { License } from './entities/license.entity';
import { Artwork } from '../artworks/entities/artwork.entity';
import { StripeService } from 'src/common/services/stripe.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepo: Repository<OrderItem>,
    @InjectRepository(License) private licenseRepo: Repository<License>,
    @InjectRepository(Artwork) private artworkRepo: Repository<Artwork>,
    private stripeService: StripeService,
  ) {}

  async createLicenseOrder(userId: string, dto: CreateOrderDto) {
    // Full logic from your original createCheckoutSession
    // Fetch tier, artwork, seller, calculate price, tax, fee, create Order + OrderItem, create PaymentIntent
  }

  async confirmOrder(orderId: string, paymentIntentId: string) {
    // Verify payment, mark order as paid, issue license, trigger payout
  }

  async getMyOrders(userId: string) {
    return this.orderRepo.find({
      where: { buyer_id: userId },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
  }

  async getMyLicenses(userId: string) {
    return this.licenseRepo.find({
      where: { buyer_id: userId, is_active: true },
      relations: ['orderItem'],
      order: { created_at: 'DESC' },
    });
  }

  async revokeLicense(licenseId: string, userId: string) {
    const license = await this.licenseRepo.findOne({ where: { id: licenseId } });
    if (!license) throw new NotFoundException('License not found');

    if (license.seller_id !== userId && !/* admin check */) {
      throw new ForbiddenException('Not authorized');
    }

    license.is_active = false;
    license.revoked_at = new Date();
    license.revoked_by = userId;
    return this.licenseRepo.save(license);
  }
}