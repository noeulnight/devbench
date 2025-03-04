import { Module } from '@nestjs/common';
import { WarnService } from './warn.service';
import { WarnController } from './warn.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DiscordModule } from '@discord-nestjs/core';
import { WarnCommand } from './command/grant-warn.command';
import { UserModule } from 'src/user/user.module';
import { WarnGroupCommand } from './command/warn-group.command';
import { WarnHistoryCommand } from './command/warn.command';
@Module({
  imports: [PrismaModule, DiscordModule.forFeature(), UserModule],
  controllers: [WarnController],
  providers: [WarnService, WarnCommand, WarnGroupCommand, WarnHistoryCommand],
})
export class WarnModule {}
