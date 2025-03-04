import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { InjectDiscordClient } from '@discord-nestjs/core';
import { Client } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import {
  BotException,
  UserNotFoundException,
} from './exception/user.exception';
import { DiscordException } from 'src/common/exception/discord.exception';

@Injectable()
export class UserService {
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  public async getUserById(id: string, forceCreate = false) {
    const cachedUser = await this.prismaService.user.findUnique({
      where: { id },
      include: { leaderboard: true },
    });

    if (forceCreate) {
      if (cachedUser) return cachedUser;
      return this.prismaService.user.create({
        data: {
          id,
          nickname: '알 수 없음',
          avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png',
        },
        include: { leaderboard: true },
      });
    }

    try {
      const guildMember = await this.client.guilds.cache
        .get(this.configService.get('DISCORD_GUILD_ID'))
        .members.fetch(id);
      if (guildMember.user.bot) throw new BotException();

      const user = await this.prismaService.user.upsert({
        where: { id },
        create: {
          id,
          nickname: guildMember?.displayName,
          avatarUrl: guildMember?.user.avatarURL(),
        },
        update: {
          nickname: guildMember?.displayName,
          avatarUrl: guildMember?.user.avatarURL(),
        },
        include: { leaderboard: true },
      });

      return user;
    } catch (error) {
      if (error instanceof DiscordException) throw error;
      if (!cachedUser) throw new UserNotFoundException();
      return cachedUser;
    }
  }
}
