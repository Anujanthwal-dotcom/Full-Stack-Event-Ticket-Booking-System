import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { AiSearchService } from './ai-search.service';
import { RateLimit } from '../rate-limit/rate-limit.decorator';

@Controller('api/ai-search')
export class AiSearchController {
  constructor(private aiSearchService: AiSearchService) {}

  @Get('search')
  @RateLimit(60_000, 10)
  search(@Query('q') query: string) {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException("Query parameter 'q' is required");
    }
    return this.aiSearchService.search(query);
  }
}
