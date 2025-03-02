import { Module } from '@nestjs/common';
import { PointService } from './point.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { DiscordModule } from '@discord-nestjs/core';
import { StoreCommand } from './command/store.command';
import { PointCommand } from './command/point.command';
import { PointGroupCommand } from './command/point-group.command';
import { GrantPointCommand } from './command/grant-point.command';
import { RevokePointCommand } from './command/revoke-point.command';
import { ContextGrantPointCommand } from './command/context-grant-point.command';
import { ContextRevokePointCommand } from './command/context-revoke-xp.command';

@Module({
  imports: [PrismaModule, UserModule, DiscordModule.forFeature()],
  providers: [
    PointService,
    StoreCommand,
    PointCommand,
    PointGroupCommand,
    GrantPointCommand,
    RevokePointCommand,
    ContextGrantPointCommand,
    ContextRevokePointCommand,
  ],
  exports: [PointService],
})
export class PointModule {}
