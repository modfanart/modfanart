import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TagsService } from '../services/tags.service';
import { AddTagDto } from '../dto/add-tag.dto';

@Controller('artworks')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post(':artworkId/tags')
  @UseGuards(JwtAuthGuard)
  async addTag(
    @Req() req,
    @Param('artworkId') artworkId: string,
    @Body() dto: AddTagDto,
  ) {
    return this.tagsService.addTagToArtwork(artworkId, dto, req.user.id);
  }

  @Delete(':artworkId/tags/:tagId')
  @UseGuards(JwtAuthGuard)
  async removeTag(
    @Req() req,
    @Param('artworkId') artworkId: string,
    @Param('tagId') tagId: string,
  ) {
    return this.tagsService.removeTagFromArtwork(artworkId, tagId, req.user.id);
  }

  @Get(':artworkId/tags')
  async getTags(@Param('artworkId') artworkId: string) {
    return this.tagsService.getTagsForArtwork(artworkId);
  }
}
