import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagsController } from './controllers/tags.controller';
import { TagsService } from './services/tags.service';
import { Tag } from './entities/tag.entity';
import { Tagging } from './entities/tagging.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, Tagging])],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
