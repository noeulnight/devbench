import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { InjectDiscordClient } from '@discord-nestjs/core';
import { Client } from 'discord.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  public async getUserById(id: string) {
    const guildMember = await this.client.guilds.cache
      .get(this.configService.get('GUILD_ID'))
      .members.fetch(id);

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
    });

    return user;
  }
}
