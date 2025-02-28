import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PointModule } from 'src/point/point.module';
import { DiscordModule } from '@discord-nestjs/core';

@Module({
  imports: [PrismaModule, PointModule, DiscordModule.forFeature()],
  controllers: [PurchaseController],
  providers: [PurchaseService],
  exports: [PurchaseService],
})
export class PurchaseModule {}
