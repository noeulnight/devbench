import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DiscordModule } from '@discord-nestjs/core';
import { UserController } from './user.controller';
import { FetchAllGuildMembersCommand } from './command/fetch-all-guild-members.command';

@Module({
  imports: [PrismaModule, DiscordModule.forFeature()],
  providers: [UserService, FetchAllGuildMembersCommand],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
