import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { ConfirmOrderDto } from '../dto/confirm-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('license')
  @UseGuards(JwtAuthGuard)
  async createLicenseOrder(@Req() req, @Body() dto: CreateOrderDto) {
    return this.ordersService.createLicenseOrder(req.user.id, dto);
  }

  @Post(':id/confirm')
  @UseGuards(JwtAuthGuard)
  async confirmOrder(@Param('id') id: string, @Body() dto: ConfirmOrderDto) {
    return this.ordersService.confirmOrder(id, dto.paymentIntentId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyOrders(@Req() req) {
    return this.ordersService.getMyOrders(req.user.id);
  }

  @Get('me/licenses')
  @UseGuards(JwtAuthGuard)
  async getMyLicenses(@Req() req) {
    return this.ordersService.getMyLicenses(req.user.id);
  }

  @Get('issued')
  @UseGuards(JwtAuthGuard)
  async getIssuedLicenses(@Req() req) {
    // licenses where seller_id = req.user.id
  }

  @Patch('licenses/:id/revoke')
  @UseGuards(JwtAuthGuard)
  async revokeLicense(@Param('id') id: string, @Req() req) {
    return this.ordersService.revokeLicense(id, req.user.id);
  }
}
