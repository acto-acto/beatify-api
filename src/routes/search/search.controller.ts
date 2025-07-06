import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchDto } from './dto/search.dto';
import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  search(@Req() req, @Query() dto: SearchDto) {
    const userId = req?.user?.userId;
    return this.searchService.searchEverything(dto.query, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('query-history')
  findAllQueries(@Req() req) {
    const userId = req?.user?.userId;
    return this.searchService.getSearchQueries(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('query-history')
  removeAllQuery(@Req() req, @Param('id') id: string) {
    const userId = req?.user?.userId;
    return this.searchService.removeAllSearchQueries(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('query-history/:id')
  removeQuery(@Req() req, @Param('id') id: string) {
    const userId = req?.user?.userId;
    return this.searchService.removeSearchQuery(userId, id);
  }
}
