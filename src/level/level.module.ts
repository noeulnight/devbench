import { Module } from '@nestjs/common';
import { LevelService } from './level.service';
import { DiscordModule } from '@discord-nestjs/core';
import { UserModule } from 'src/user/user.module';
import { LevelImageModule } from 'src/level-image/level-image.module';
import { XpModule } from 'src/xp/xp.module';
import { LevelCommand } from './command/level.command';
import { PointModule } from 'src/point/point.module';
import { ContextLevelCommand } from './command/context-level.command';

@Module({
  imports: [
    DiscordModule.forFeature(),
    UserModule,
    LevelImageModule,
    PointModule,
    XpModule,
  ],
  providers: [LevelService, LevelCommand, ContextLevelCommand],
})
export class LevelModule {}
