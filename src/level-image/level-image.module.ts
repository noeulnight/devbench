import { Module } from '@nestjs/common';
import { LevelImageService } from './level-image.service';

@Module({
  providers: [LevelImageService],
  exports: [LevelImageService],
})
export class LevelImageModule {}
