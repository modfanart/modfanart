import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { BrandManager } from './entities/brand-manager.entity';
import { BrandArtwork } from './entities/brand-artwork.entity';
import { BrandPost } from './entities/brand-post.entity';
import { BrandVerificationRequest } from './entities/brand-verification-request.entity';
import { CreateBrandDto } from './dto/create-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand) private brandRepo: Repository<Brand>,
    @InjectRepository(BrandManager)
    private managerRepo: Repository<BrandManager>,
    @InjectRepository(BrandArtwork)
    private brandArtworkRepo: Repository<BrandArtwork>,
    @InjectRepository(BrandPost) private brandPostRepo: Repository<BrandPost>,
    @InjectRepository(BrandVerificationRequest)
    private verificationRepo: Repository<BrandVerificationRequest>,
  ) {}

  async getAllBrands(query: any) {
    // Full implementation with pagination, search, sorting...
    const {
      limit = 20,
      offset = 0,
      search,
      minFollowers,
      sortBy = 'followers_count',
      sortOrder = 'desc',
    } = query;

    // ... (similar to your original controller)
  }

  async findById(id: string, options: any = {}) {
    const brand = await this.brandRepo.findOne({
      where: { id, deleted_at: null },
      relations: ['managers', 'brand_artworks', 'posts'],
    });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async findBySlug(slug: string, options: any = {}) {
    // similar
  }

  async create(userId: string, dto: CreateBrandDto) {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const brand = this.brandRepo.create({
      ...dto,
      slug,
      user_id: userId,
      status: 'active',
    });
    const savedBrand = await this.brandRepo.save(brand);

    await this.managerRepo.save({
      brand_id: savedBrand.id,
      user_id: userId,
      role: 'owner',
    });

    return savedBrand;
  }

  async hasBrandAccess(
    brandId: string,
    userId: string,
    allowedRoles: string[] = ['owner', 'manager'],
  ) {
    const access = await this.managerRepo.findOne({
      where: { brand_id: brandId, user_id: userId, role: allowedRoles as any },
    });
    return !!access;
  }

  // Add more methods: update, delete, addArtwork, createPost, follow, verification, etc.
}
