import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { InjectDiscordClient, On } from '@discord-nestjs/core';
import { Client, Events, GuildMember } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import {
  BotException,
  UserNotFoundException,
} from './exception/user.exception';
import { DiscordException } from 'src/common/exception/discord.exception';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  @On(Events.GuildMemberAdd)
  async onGuildMemberAdd(member: GuildMember) {
    await this.getUserById(member.id, true);
  }

  public async fetchAllGuildMembers() {
    const guild = await this.client.guilds.cache.get(
      this.configService.get('DISCORD_GUILD_ID'),
    );
    const members = await guild.members.fetch();

    await this.prismaService.$transaction(async (tx) => {
      await Promise.all(
        members.map(async (member) => {
          if (member.user.bot) return;

          await tx.user.upsert({
            where: { id: member.id },
            update: {
              nickname: member.displayName,
              avatarUrl: member.user.avatarURL(),
            },
            create: {
              id: member.id,
              nickname: member.displayName,
              avatarUrl: member.user.avatarURL(),
            },
          });
        }),
      );
    });

    this.logger.log(`All guild members fetched and updated ${members.size}`);
    return members.size;
  }

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
