import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShowDto } from './dto/create-show.dto';
import { toShowResponse, ShowResponse } from './dto/show-response';
import { EntityNotFoundException } from '../common/entity-not-found.exception';
import { AccessDeniedException } from '../common/access-denied.exception';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class ShowsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getUpcomingShows(): Promise<ShowResponse[]> {
    const cached = await this.cacheManager.get<ShowResponse[]>('upcomingShows');
    if (cached) return cached;

    const shows = await this.prisma.show.findMany({
      where: { showDateTime: { gt: new Date() } },
      orderBy: { showDateTime: 'asc' },
    });

    const result = shows.map(toShowResponse);
    await this.cacheManager.set('upcomingShows', result, 60_000);
    return result;
  }

  async getPastShows(): Promise<ShowResponse[]> {
    const cached = await this.cacheManager.get<ShowResponse[]>('pastShows');
    if (cached) return cached;

    const shows = await this.prisma.show.findMany({
      where: { showDateTime: { lt: new Date() } },
      orderBy: { showDateTime: 'desc' },
    });

    const result = shows.map(toShowResponse);
    await this.cacheManager.set('pastShows', result, 60_000);
    return result;
  }

  async getShowById(id: number): Promise<ShowResponse> {
    const cached = await this.cacheManager.get<ShowResponse>(`show:${id}`);
    if (cached) return cached;

    const show = await this.prisma.show.findUnique({
      where: { id },
      include: { createdBy: true },
    });

    if (!show) {
      throw new EntityNotFoundException(`Show with ID ${id} not found`);
    }

    const result = toShowResponse(show);
    await this.cacheManager.set(`show:${id}`, result, 60_000);
    return result;
  }

  async searchShows(query: string): Promise<ShowResponse[]> {
    const shows = await this.prisma.show.findMany({
      where: {
        showDateTime: { gt: new Date() },
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { venue: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { showDateTime: 'asc' },
    });

    return shows.map(toShowResponse);
  }

  async createShow(
    dto: CreateShowDto,
    userId: number,
  ): Promise<ShowResponse> {
    const show = await this.prisma.show.create({
      data: {
        title: dto.title,
        description: dto.description,
        showDateTime: new Date(dto.showDateTime),
        venue: dto.venue,
        totalSeats: dto.totalSeats,
        availableSeats: dto.totalSeats,
        price: dto.price,
        createdById: userId,
      },
    });

    await this.evictCache();
    return toShowResponse(show);
  }

  async deleteShow(showId: number, userId: number): Promise<void> {
    const show = await this.prisma.show.findUnique({
      where: { id: showId },
      include: { tickets: { where: { status: 'BOOKED' } } },
    });

    if (!show) {
      throw new EntityNotFoundException(`Show with ID ${showId} not found`);
    }

    if (show.createdById !== userId) {
      throw new AccessDeniedException(
        'You are not authorized to delete this show',
      );
    }

    if (show.tickets.length > 0) {
      throw new Error('Cannot delete show with active bookings');
    }

    await this.prisma.show.delete({ where: { id: showId } });
    await this.evictCache();
    await this.cacheManager.del(`show:${showId}`);
  }

  async searchWithFilters(criteria: {
    keyword?: string;
    venue?: string;
    minPrice?: number;
    maxPrice?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ShowResponse[]> {
    const where: any = {
      showDateTime: { gt: new Date() },
    };

    if (criteria.keyword) {
      where.OR = [
        { title: { contains: criteria.keyword, mode: 'insensitive' } },
        { description: { contains: criteria.keyword, mode: 'insensitive' } },
      ];
    }

    if (criteria.venue) {
      where.venue = { contains: criteria.venue, mode: 'insensitive' };
    }

    if (criteria.minPrice !== undefined) {
      where.price = { ...(where.price || {}), gte: criteria.minPrice };
    }

    if (criteria.maxPrice !== undefined) {
      where.price = { ...(where.price || {}), lte: criteria.maxPrice };
    }

    if (criteria.dateFrom) {
      where.showDateTime = {
        ...(where.showDateTime || {}),
        gte: new Date(criteria.dateFrom),
      };
    }

    if (criteria.dateTo) {
      where.showDateTime = {
        ...(where.showDateTime || {}),
        lte: new Date(criteria.dateTo),
      };
    }

    const shows = await this.prisma.show.findMany({
      where,
      orderBy: { showDateTime: 'asc' },
    });

    return shows.map(toShowResponse);
  }

  private async evictCache() {
    await this.cacheManager.del('upcomingShows');
    await this.cacheManager.del('pastShows');
  }
}
