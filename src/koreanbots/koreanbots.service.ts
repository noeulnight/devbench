import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  KoreanBotsException,
  KoreanBotsAlreadyHeartException,
} from './exception/koreanbots.exception';
import { isAxiosError } from 'axios';
import { UserService } from 'src/user/user.service';
import { XpService } from 'src/xp/xp.service';
import { PointService } from 'src/point/point.service';
import { ConfigService } from '@nestjs/config';
import { isSameSecond } from 'date-fns';

@Injectable()
export class KoreanbotsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    private readonly xpService: XpService,
    private readonly pointService: PointService,
    private readonly configService: ConfigService,
  ) {}

  public async checkHearted(userId: string) {
    try {
      const guildId = this.configService.get('DISCORD_GUILD_ID');
      const response = await firstValueFrom(
        this.httpService.get(`/v2/servers/${guildId}/vote`, {
          params: {
            userID: userId,
          },
        }),
      );
      if (!response.data.data.voted) return { voted: false };

      const user = await this.userService.getUserById(userId);
      if (
        isSameSecond(
          user.lastKoreanbotsHeart,
          new Date(response.data.data.lastVote),
        )
      )
        throw new KoreanBotsAlreadyHeartException();

      await this.prismaService.user.update({
        where: { id: userId },
        data: { lastKoreanbotsHeart: new Date(response.data.data.lastVote) },
      });

      await this.xpService.addXp({
        userId,
        amount: 50,
        reason: '한디리 하트 보상',
      });
      await this.pointService.addPoint({
        userId,
        amount: 50,
        reason: '한디리 하트 보상',
      });

      return { voted: true };
    } catch (error) {
      if (isAxiosError(error)) throw new KoreanBotsException();
      throw error;
    }
  }
}
