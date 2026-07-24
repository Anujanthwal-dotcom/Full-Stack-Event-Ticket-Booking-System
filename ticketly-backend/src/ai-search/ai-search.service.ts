import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ShowsService } from '../shows/shows.service';

interface SearchCriteria {
  keyword?: string;
  venue?: string;
  minPrice?: number;
  maxPrice?: number;
  dateFrom?: string;
  dateTo?: string;
}

@Injectable()
export class AiSearchService {
  private llm: ChatGoogleGenerativeAI;

  constructor(
    private configService: ConfigService,
    private showsService: ShowsService,
  ) {
    this.llm = new ChatGoogleGenerativeAI({
      apiKey: this.configService.get<string>('app.gemini.apiKey'),
      model: 'gemini-2.0-flash',
      temperature: 0,
    });
  }

  async search(query: string) {
    try {
      const systemPrompt = `You are a show search assistant. Extract search filters from the user's natural language query about shows/events.
Return a JSON object with these fields (use null for unspecified fields):
- "keyword": text to search in show title or description (e.g. "jazz", "comedy")
- "venue": venue name or location to filter by
- "minPrice": minimum price (number, e.g. 10.00)
- "maxPrice": maximum price (number, e.g. 50.00)
- "dateFrom": start date in ISO format (e.g. "2025-01-01")
- "dateTo": end date in ISO format (e.g. "2025-12-31")
Handle relative dates like "this weekend", "tomorrow", "next week" by converting to absolute ISO dates.
Return ONLY the JSON object, no other text.`;

      const response = await this.llm.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(query),
      ]);

      let content =
        typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content);

      content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.fallbackSearch(query);
      }

      const criteria: SearchCriteria = JSON.parse(jsonMatch[0]);
      return this.showsService.searchWithFilters(criteria);
    } catch (error) {
      console.error('AI search failed, falling back:', error);
      return this.fallbackSearch(query);
    }
  }

  private fallbackSearch(query: string) {
    return this.showsService.searchShows(query);
  }
}
