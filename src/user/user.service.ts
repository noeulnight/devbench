import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { InjectDiscordClient } from '@discord-nestjs/core';
import { Client } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import {
  BotException,
  UserNotFoundException,
} from './exception/user.exception';

@Injectable()
export class UserService {
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  public async getUserById(id: string) {
    const cachedUser = await this.prismaService.user.findUnique({
      where: { id },
    });

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
      if (!cachedUser) throw new UserNotFoundException();
      return cachedUser;
    }
  }
}
