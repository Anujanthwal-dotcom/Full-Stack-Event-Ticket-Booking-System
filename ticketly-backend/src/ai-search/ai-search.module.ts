import { Module } from '@nestjs/common';
import { AiSearchController } from './ai-search.controller';
import { AiSearchService } from './ai-search.service';
import { ShowsModule } from '../shows/shows.module';

@Module({
  imports: [ShowsModule],
  controllers: [AiSearchController],
  providers: [AiSearchService],
})
export class AiSearchModule {}
