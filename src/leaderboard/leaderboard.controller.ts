import { Controller, Get, Query } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  async getLeaderboard(@Query() query: PaginationQueryDto) {
    const [nodes, totalCount] = await Promise.all([
      this.leaderboardService.getLeaderboard(query),
      this.leaderboardService.countLeaderboard(),
    ]);

    return {
      nodes,
      totalCount,
    };
  }
}
