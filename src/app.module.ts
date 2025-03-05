import { Module } from '@nestjs/common';
import { DiscordModule } from '@discord-nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GatewayIntentBits, Message } from 'discord.js';
import { LevelModule } from './level/level.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { XpModule } from './xp/xp.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { PointModule } from './point/point.module';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { DiscordModule as DiscordNestModule } from './discord/discord.module';
import { PurchaseModule } from './purchase/purchase.module';
import { WarnModule } from './warn/warn.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configSerivce: ConfigService) => ({
        token: configSerivce.get('DISCORD_BOT_TOKEN'),
        discordClientOptions: {
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
          ],
        },
        registerCommandOptions: [
          {
            forGuild: configSerivce.get('DISCORD_GUILD_ID'),
            allowFactory: (message: Message) =>
              !message.author.bot &&
              message.member.id === '403025222921486338' &&
              message.content === '!deploy',
          },
        ],
      }),
    }),
    XpModule,
    AuthModule,
    UserModule,
    LevelModule,
    PointModule,
    ProductModule,
    LeaderboardModule,
    DiscordNestModule,
    PurchaseModule,
    WarnModule,
  ],
})
export class AppModule {}
