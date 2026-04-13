import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { GlobalSearchDto } from './dto/global-search.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async globalSearch(@Query() dto: GlobalSearchDto) {
    return this.searchService.globalSearch({
      q: dto.q,
      limit: dto.limit,
      offset: dto.offset,
      type: dto.type,
    });
  }
}
