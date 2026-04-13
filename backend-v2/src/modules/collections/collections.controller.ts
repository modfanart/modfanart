import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req, @Body() dto: CreateCollectionDto) {
    // Optional: You can add ownership validation here
    return this.collectionsService.create(dto);
  }

  @Get()
  async getCollections(
    @Query('owner_type') owner_type: string,
    @Query('owner_id') owner_id: string,
  ) {
    if (!owner_type || !owner_id) {
      return { error: 'owner_type and owner_id are required' };
    }
    return this.collectionsService.findByOwner(owner_type, owner_id);
  }

  @Get(':id')
  async getCollection(@Param('id') id: string) {
    return this.collectionsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateCollectionDto) {
    return this.collectionsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    return this.collectionsService.softDelete(id);
  }
  @Post(':collectionId/items')
  @UseGuards(JwtAuthGuard)
  async addItem(
    @Req() req,
    @Param('collectionId') collectionId: string,
    @Body() dto: AddToCollectionDto,
  ) {
    return this.collectionsService.addItem(collectionId, dto, req.user.id);
  }

  @Delete(':collectionId/items/:artworkId')
  @UseGuards(JwtAuthGuard)
  async removeItem(
    @Req() req,
    @Param('collectionId') collectionId: string,
    @Param('artworkId') artworkId: string,
  ) {
    return this.collectionsService.removeItem(
      collectionId,
      artworkId,
      req.user.id,
    );
  }

  @Get(':id/with-items')
  async getCollectionWithItems(@Param('id') id: string) {
    return this.collectionsService.getCollectionWithItems(id);
  }
}
