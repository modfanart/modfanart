import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';
import { Brand } from './entities/brand.entity';
import { BrandManager } from './entities/brand-manager.entity';
import { BrandArtwork } from './entities/brand-artwork.entity';
import { BrandPost } from './entities/brand-post.entity';
import { BrandPostComment } from './entities/brand-post-comment.entity';
import { BrandVerificationRequest } from './entities/brand-verification-request.entity';
import { BrandAccessGuard } from '../../common/guards/brand-access.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Brand,
      BrandManager,
      BrandArtwork,
      BrandPost,
      BrandPostComment,
      BrandVerificationRequest,
    ]),
  ],
  controllers: [BrandsController],
  providers: [BrandsService, BrandAccessGuard],
  exports: [BrandsService],
})
export class BrandsModule {}
