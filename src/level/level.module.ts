import { Module } from '@nestjs/common';

import { LevelService } from './level.service';
import { DiscordModule } from '@discord-nestjs/core';
import { UserModule } from 'src/user/user.module';
import { LevelImageModule } from 'src/level-image/level-image.module';
import { XpModule } from 'src/xp/xp.module';
import { LevelCommand } from './command/level.command';

@Module({
  imports: [DiscordModule.forFeature(), XpModule, UserModule, LevelImageModule],
  providers: [LevelService, LevelCommand],
})
export class LevelModule {}
