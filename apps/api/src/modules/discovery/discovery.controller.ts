import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DiscoveryService } from './discovery.service.js';
import { SearchDiscoveryDto } from './dto/search-discovery.dto.js';

@ApiTags('discovery')
@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get('search')
  async search(@Query() dto: SearchDiscoveryDto) {
    return this.discoveryService.search(dto);
  }

  @Get('teachers/:publicSlug')
  async teacherProfile(@Param('publicSlug') publicSlug: string) {
    return this.discoveryService.publicTeacherProfile(publicSlug);
  }
}

