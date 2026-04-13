import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../rbac/guards/roles.guard';
import { Roles } from '../../rbac/decorators/roles.decorator';
import { BrandAccessGuard } from '../guards/brand-access.guard';
import { BrandsService } from '../services/brands.service';
import { CreateBrandDto } from '../dto/create-brand.dto';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  getAllBrands(@Query() query: any) {
    return this.brandsService.getAllBrands(query);
  }

  @Get(':id')
  getBrand(@Param('id') id: string, @Query() query: any) {
    return this.brandsService.findById(id, query);
  }

  @Get('slug/:slug')
  getBrandBySlug(@Param('slug') slug: string, @Query() query: any) {
    return this.brandsService.findBySlug(slug, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createBrand(@Req() req, @Body() dto: CreateBrandDto) {
    return this.brandsService.create(req.user.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, BrandAccessGuard)
  updateBrand(@Param('id') id: string, @Req() req, @Body() dto: any) {
    return this.brandsService.updateBrand(id, dto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  deleteBrand(@Param('id') id: string, @Req() req) {
    return this.brandsService.softDelete(id, req.user.id);
  }

  // Add more routes as needed (posts, artworks, verification, etc.)
}
