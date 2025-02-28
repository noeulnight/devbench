import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  private readonly logger: Logger = new Logger(LeaderboardService.name);

  constructor(private readonly prismaService: PrismaService) {}

  public async countLeaderboard() {
    return this.prismaService.leaderboard.count();
  }

  public async getLeaderboard(query: PaginationQueryDto): Promise<
    Prisma.LeaderboardGetPayload<{
      select: {
        xp: true;
        level: true;
        currentRank: true;
        previousRank: true;
        rankDifference: true;
        updatedAt: true;
        user: {
          select: {
            id: true;
            nickname: true;
            avatarUrl: true;
          };
        };
      };
    }>[]
  > {
    const { pageSize, page } = query;

    const leaderboard = await this.prismaService.leaderboard.findMany({
      orderBy: { currentRank: 'asc' },
      select: {
        xp: true,
        level: true,
        currentRank: true,
        previousRank: true,
        rankDifference: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
          },
        },
      },
      skip: page,
      take: pageSize,
    });

    return leaderboard;
  }

  @Cron('*/5 * * * *')
  async updateLeaderboard() {
    this.logger.log('Updating leaderboard...');

    const users = await this.prismaService.user.findMany({
      orderBy: { xp: 'desc' },
      include: { leaderboard: true },
    });

    await Promise.all(
      users.map(async (user, index) => {
        const previousRank = user.leaderboard?.currentRank || index + 1;
        const rankDifference = previousRank - (index + 1);

        await this.prismaService.leaderboard.upsert({
          where: { userId: user.id },
          update: {
            xp: user.xp,
            level: user.level,
            currentRank: index + 1,
            previousRank,
            rankDifference,
          },
          create: {
            userId: user.id,
            currentRank: index + 1,
            xp: user.xp,
            level: user.level,
            previousRank,
            rankDifference,
          },
        });
      }),
    );
  }
}
