import { Module } from '@nestjs/common';
import { DiscordModule } from '@discord-nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GatewayIntentBits, Message } from 'discord.js';
import { LevelModule } from './level/level.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { XpModule } from './xp/xp.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configSerivce: ConfigService) => ({
        token: configSerivce.get('DISCORD_TOKEN'),
        discordClientOptions: {
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
          ],
        },
        registerCommandOptions: [
          {
            forGuild: configSerivce.get('GUILD_ID_WITH_COMMANDS'),
            removeCommandsBefore: true,
            allowFactory: (message: Message) =>
              !message.author.bot &&
              message.member.id === '403025222921486338' &&
              message.content === '!deploy-prod',
          },
        ],
      }),
    }),
    LevelModule,
    UserModule,
    XpModule,
    LeaderboardModule,
  ],
})
export class AppModule {}
