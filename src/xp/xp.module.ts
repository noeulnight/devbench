import { Module } from '@nestjs/common';
import { XpService } from './xp.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { XpCommand } from './command/xp.command';
import { GrantXpCommand } from './command/grant-xp.command';
import { RevokeXpCommand } from './command/revoke-xp.command';
import { DiscordModule } from '@discord-nestjs/core';

@Module({
  imports: [PrismaModule, UserModule, DiscordModule.forFeature()],
  providers: [XpService, XpCommand, GrantXpCommand, RevokeXpCommand],
  exports: [XpService],
})
export class XpModule {}
