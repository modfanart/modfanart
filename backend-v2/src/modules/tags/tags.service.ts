import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { Tagging } from './entities/tagging.entity';
import { AddTagDto } from './dto/add-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag) private tagRepo: Repository<Tag>,
    @InjectRepository(Tagging) private taggingRepo: Repository<Tagging>,
  ) {}

  async addTagToArtwork(artworkId: string, dto: AddTagDto, userId: string) {
    let tag = await this.tagRepo.findOne({
      where: [{ name: dto.tagName }, { slug: this.generateSlug(dto.tagName) }],
    });

    if (!tag) {
      const slug = this.generateSlug(dto.tagName);
      tag = this.tagRepo.create({
        name: dto.tagName.trim(),
        slug,
        created_by: userId,
        approved: false,
        usage_count: 1,
      });
      tag = await this.tagRepo.save(tag);
    } else {
      // Increment usage count
      await this.tagRepo.increment({ id: tag.id }, 'usage_count', 1);
    }

    // Add tagging (polymorphic)
    const tagging = this.taggingRepo.create({
      tag_id: tag.id,
      taggable_type: 'artwork',
      taggable_id: artworkId,
      created_by: userId,
    });

    await this.taggingRepo.save(tagging);

    return { tag, message: 'Tag added successfully' };
  }

  async removeTagFromArtwork(artworkId: string, tagId: string, userId: string) {
    const result = await this.taggingRepo.delete({
      tag_id: tagId,
      taggable_type: 'artwork',
      taggable_id: artworkId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Tag not found on this artwork');
    }

    // Optional: decrement usage count
    await this.tagRepo.decrement({ id: tagId }, 'usage_count', 1);

    return { message: 'Tag removed successfully' };
  }

  async getTagsForArtwork(artworkId: string) {
    return this.taggingRepo.find({
      where: { taggable_type: 'artwork', taggable_id: artworkId },
      relations: ['tag'],
      order: { created_at: 'DESC' },
    });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}
