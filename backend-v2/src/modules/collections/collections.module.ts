import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionsController } from './controllers/collections.controller';
import { CollectionsService } from './services/collections.service';
import { Collection } from './entities/collection.entity';
import { CollectionItem } from './entities/collection-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, CollectionItem])],
  controllers: [CollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService],
})
export class CollectionsModule {}
