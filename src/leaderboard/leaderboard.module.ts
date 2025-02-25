import { Module } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardController } from './leaderboard.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DiscordModule } from '@discord-nestjs/core';
import { LeaderboardCommand } from './command/leaderboard.command';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot(), DiscordModule.forFeature()],
  controllers: [LeaderboardController],
  providers: [LeaderboardService, LeaderboardCommand],
})
export class LeaderboardModule {}
