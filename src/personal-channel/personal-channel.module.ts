import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PersonalChannelService } from './personal-channel.service';
import { DiscordModule } from '@discord-nestjs/core';
import { PersonalChannelCommand } from './command/personal-channel.command';
import { PersonalChannelInfoCommand } from './command/personal-channel-info.command';

@Module({
  imports: [PrismaModule, DiscordModule.forFeature()],
  providers: [
    PersonalChannelService,
    PersonalChannelCommand,
    PersonalChannelInfoCommand,
  ],
  exports: [PersonalChannelService],
})
export class PersonalChannelModule {}
