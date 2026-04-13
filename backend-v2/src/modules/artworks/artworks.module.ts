import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtworksController } from './artworks.controller';
import { ArtworksService } from './artworks.service';
import { Artwork } from './entities/artwork.entity';
import { ArtworkPricingTier } from './entities/artwork-pricing-tier.entity';
import { ArtworkCategory } from './entities/artwork-category.entity';
import { Favorite } from './entities/favorite.entity'; // ← NEW
import { S3Service } from 'src/common/services/s3.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Artwork,
      ArtworkPricingTier,
      ArtworkCategory,
      Favorite, // ← NEW
    ]),
  ],
  controllers: [ArtworksController],
  providers: [ArtworksService, S3Service],
  exports: [ArtworksService],
})
export class ArtworksModule {}
