import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ShowsService } from './shows.service';
import { CreateShowDto } from './dto/create-show.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RateLimit } from '../rate-limit/rate-limit.decorator';

@Controller('api/shows')
export class ShowsController {
  constructor(private showsService: ShowsService) {}

  @Get()
  getUpcomingShows() {
    return this.showsService.getUpcomingShows();
  }

  @Get('past')
  getPastShows() {
    return this.showsService.getPastShows();
  }

  @Get('search')
  @RateLimit(60_000, 10)
  searchShows(@Query('q') query: string) {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException("Query parameter 'q' is required");
    }
    return this.showsService.searchShows(query);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  getShowById(@Param('id', ParseIntPipe) id: number) {
    return this.showsService.getShowById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  createShow(@Body() dto: CreateShowDto, @Req() req: Request) {
    const user = (req as any).session?.passport?.user;
    return this.showsService.createShow(dto, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteShow(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const user = (req as any).session?.passport?.user;
    await this.showsService.deleteShow(id, user);
  }
}
