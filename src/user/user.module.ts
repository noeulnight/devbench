import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DiscordModule } from '@discord-nestjs/core';

@Module({
  imports: [PrismaModule, DiscordModule.forFeature()],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
