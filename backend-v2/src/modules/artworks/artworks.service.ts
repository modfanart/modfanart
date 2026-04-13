import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artwork } from './entities/artwork.entity';
import { ArtworkPricingTier } from './entities/artwork-pricing-tier.entity';
import { ArtworkCategory } from './entities/artwork-category.entity';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { S3Service } from '../../common/services/s3.service'; // Create this
import { Favorite } from './entities/favorite.entity';
@Injectable()
export class ArtworksService {
  constructor(
    @InjectRepository(Artwork) private artworkRepo: Repository<Artwork>,
    @InjectRepository(Favorite) private favoriteRepo: Repository<Favorite>,
    private artworkRepo: Repository<Artwork>,

    @InjectRepository(ArtworkPricingTier)
    private pricingRepo: Repository<ArtworkPricingTier>,

    @InjectRepository(ArtworkCategory)
    private artworkCategoryRepo: Repository<ArtworkCategory>,

    private s3Service: S3Service,
  ) {}

  async create(
    userId: string,
    file: Express.Multer.File,
    dto: CreateArtworkDto,
  ) {
    // Upload to S3
    const fileKey = `artworks/${userId}/${crypto.randomUUID()}${path.extname(file.originalname)}`;
    const fileUrl = await this.s3Service.uploadFile(file, fileKey);

    const artwork = this.artworkRepo.create({
      creator_id: userId,
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      file_url: fileUrl,
      thumbnail_url: fileUrl, // TODO: generate thumbnail
      source_file_url: fileUrl,
      status: 'draft',
      moderation_status: 'pending',
    });

    const savedArtwork = await this.artworkRepo.save(artwork);

    // Assign categories
    if (dto.category_ids?.length) {
      const artworkCategories = dto.category_ids.map((catId) => ({
        artwork_id: savedArtwork.id,
        category_id: catId,
      }));
      await this.artworkCategoryRepo.insert(artworkCategories);
    }

    // Create pricing tiers
    if (dto.pricing_tiers?.length) {
      const tiers = dto.pricing_tiers.map((tier) => ({
        artwork_id: savedArtwork.id,
        license_type: tier.license_type,
        price_inr_cents: tier.price_inr_cents || 0,
        price_usd_cents: tier.price_usd_cents || 0,
        is_active: true,
      }));
      await this.pricingRepo.insert(tiers);
    }

    return savedArtwork;
  }

  async findOne(id: string) {
    const artwork = await this.artworkRepo.findOne({
      where: { id, deleted_at: null },
      relations: ['pricing_tiers', 'creator'],
    });

    if (!artwork) throw new NotFoundException('Artwork not found');
    return artwork;
  }

  async publish(id: string, userId: string) {
    const artwork = await this.findOne(id);
    if (artwork.creator_id !== userId)
      throw new ForbiddenException('Not your artwork');

    if (artwork.status !== 'draft')
      throw new BadRequestException('Only drafts can be published');

    artwork.status = 'published';
    artwork.moderation_status = 'approved';
    return this.artworkRepo.save(artwork);
  }

  async softDelete(id: string, userId: string) {
    const artwork = await this.findOne(id);
    if (artwork.creator_id !== userId)
      throw new ForbiddenException('Not your artwork');

    artwork.deleted_at = new Date();
    artwork.status = 'archived';
    return this.artworkRepo.save(artwork);
  }
  // ───────────────────────────────────────────────
  // Favorites
  // ───────────────────────────────────────────────

  async toggleFavorite(userId: string, artworkId: string) {
    const artwork = await this.artworkRepo.findOne({
      where: { id: artworkId, deleted_at: null },
    });
    if (!artwork) throw new NotFoundException('Artwork not found');

    const existing = await this.favoriteRepo.findOne({
      where: {
        user_id: userId,
        favoritable_type: 'artwork',
        favoritable_id: artworkId,
      },
    });

    if (existing) {
      // Remove favorite
      await this.favoriteRepo.delete(existing.id);

      // Decrement counter
      await this.artworkRepo.update(artworkId, {
        favorites_count: () => '"favorites_count" - 1',
      });

      return { favorited: false, message: 'Removed from favorites' };
    } else {
      // Add favorite
      await this.favoriteRepo.save({
        user_id: userId,
        favoritable_type: 'artwork',
        favoritable_id: artworkId,
      });

      // Increment counter
      await this.artworkRepo.update(artworkId, {
        favorites_count: () => '"favorites_count" + 1',
      });

      return { favorited: true, message: 'Added to favorites' };
    }
  }

  async getMyFavoriteArtworks(userId: string, limit = 20, offset = 0) {
    const favorites = await this.favoriteRepo.find({
      where: { user_id: userId, favoritable_type: 'artwork' },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });

    if (favorites.length === 0) return [];

    const artworkIds = favorites.map((f) => f.favoritable_id);

    return this.artworkRepo.find({
      where: {
        id: In(artworkIds),
        status: 'published',
        deleted_at: null,
      },
      relations: ['creator'],
      order: { created_at: 'DESC' },
    });
  }

  async isFavorited(userId: string, artworkId: string): Promise<boolean> {
    const favorite = await this.favoriteRepo.findOne({
      where: {
        user_id: userId,
        favoritable_type: 'artwork',
        favoritable_id: artworkId,
      },
    });
    return !!favorite;
  }

  // Add more methods: getAllPublished, getMyArtworks, getByCreator, etc.
}
