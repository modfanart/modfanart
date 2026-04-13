import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection } from './entities/collection.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private collectionRepo: Repository<Collection>,
  ) {}

  async create(dto: CreateCollectionDto) {
    const slug = dto.slug || this.generateSlug(dto.name);

    // Ensure slug is unique
    const existingSlug = await this.collectionRepo.findOne({ where: { slug } });
    if (existingSlug) {
      throw new ConflictException('Slug already exists');
    }

    const collection = this.collectionRepo.create({
      ...dto,
      slug,
    });

    return this.collectionRepo.save(collection);
  }

  async findByOwner(owner_type: string, owner_id: string) {
    return this.collectionRepo.find({
      where: {
        owner_type,
        owner_id,
        deleted_at: null,
      },
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
  }

  async findById(id: string) {
    const collection = await this.collectionRepo.findOne({
      where: { id, deleted_at: null },
    });
    if (!collection) throw new NotFoundException('Collection not found');
    return collection;
  }

  async update(id: string, dto: UpdateCollectionDto) {
    const collection = await this.findById(id);

    Object.assign(collection, dto);
    return this.collectionRepo.save(collection);
  }

  async softDelete(id: string) {
    const result = await this.collectionRepo.update(
      { id, deleted_at: null },
      { deleted_at: new Date() },
    );

    if (result.affected === 0) {
      throw new NotFoundException('Collection not found');
    }
    return { message: 'Collection deleted successfully' };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  async addItem(collectionId: string, dto: AddToCollectionDto, userId: string) {
    const collection = await this.findById(collectionId);

    // Ownership check
    if (collection.owner_id !== userId) {
      throw new ForbiddenException('You do not own this collection');
    }

    // Check if artwork already exists in collection
    const existing = await this.collectionItemRepo.findOne({
      where: {
        collection_id: collectionId,
        artwork_id: dto.artwork_id,
      },
    });

    if (existing) {
      throw new ConflictException('Artwork already in this collection');
    }

    const item = this.collectionItemRepo.create({
      collection_id: collectionId,
      artwork_id: dto.artwork_id,
      sort_order: dto.sort_order || 0,
    });

    return this.collectionItemRepo.save(item);
  }

  async removeItem(collectionId: string, artworkId: string, userId: string) {
    const collection = await this.findById(collectionId);

    if (collection.owner_id !== userId) {
      throw new ForbiddenException('You do not own this collection');
    }

    const result = await this.collectionItemRepo.delete({
      collection_id: collectionId,
      artwork_id: artworkId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Item not found in collection');
    }

    return { message: 'Item removed from collection' };
  }

  async getCollectionWithItems(collectionId: string) {
    const collection = await this.collectionRepo.findOne({
      where: { id: collectionId, deleted_at: null },
      relations: ['items', 'items.artwork'],
    });

    if (!collection) throw new NotFoundException('Collection not found');

    return collection;
  }
}
