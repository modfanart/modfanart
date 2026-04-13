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
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ArtworksService } from './artworks.service';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { Favorite } from './entities/favorite.entity';
@Controller('artworks')
export class ArtworksController {
  constructor(private readonly artworksService: ArtworksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateArtworkDto,
  ) {
    const artwork = await this.artworksService.create(req.user.id, file, dto);
    return {
      message: 'Artwork created successfully (draft)',
      artwork,
    };
  }

  @Get(':id')
  async getArtwork(@Param('id') id: string) {
    const artwork = await this.artworksService.findOne(id);
    // Increment view count logic can go here
    return artwork;
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard)
  async publish(@Param('id') id: string, @Req() req) {
    await this.artworksService.publish(id, req.user.id);
    return { message: 'Artwork published successfully' };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Req() req) {
    await this.artworksService.softDelete(id, req.user.id);
    return { message: 'Artwork deleted successfully' };
  }

  @Get()
  async getArtworks(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('category_id') categoryId?: string,
  ) {
    // Implement pagination + filtering logic
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyArtworks(@Req() req, @Query('status') status?: string) {
    // Implement your getMyArtworks logic
  }

  @Get('by-creator/:creatorId')
  async getByCreator(@Param('creatorId') creatorId: string, @Query() query) {
    // Implement
  }
  // ───────────────────────────────────────────────
  // Favorites
  // ───────────────────────────────────────────────

  @Post(':artworkId/favorite')
  @UseGuards(JwtAuthGuard)
  async toggleFavorite(@Req() req, @Param('artworkId') artworkId: string) {
    const result = await this.artworksService.toggleFavorite(
      req.user.id,
      artworkId,
    );
    return result;
  }

  @Get('me/favorites')
  @UseGuards(JwtAuthGuard)
  async getMyFavorites(
    @Req() req,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    const artworks = await this.artworksService.getMyFavoriteArtworks(
      req.user.id,
      +limit,
      +offset,
    );
    return { artworks };
  }

  @Get(':artworkId/favorite/status')
  @UseGuards(JwtAuthGuard)
  async checkFavoriteStatus(@Req() req, @Param('artworkId') artworkId: string) {
    const isFavorited = await this.artworksService.isFavorited(
      req.user.id,
      artworkId,
    );
    return { isFavorited };
  }
}
