import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DiscordModule } from '@discord-nestjs/core';
import { UserController } from './user.controller';

@Module({
  imports: [PrismaModule, DiscordModule.forFeature()],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
