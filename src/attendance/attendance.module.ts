import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DiscordModule } from '@discord-nestjs/core';
import { UserModule } from 'src/user/user.module';
import { AttendanceCommand } from './command/attaendance.command';
import { XpModule } from 'src/xp/xp.module';
import { PointModule } from 'src/point/point.module';

@Module({
  imports: [
    PrismaModule,
    DiscordModule.forFeature(),
    UserModule,
    XpModule,
    PointModule,
  ],
  providers: [AttendanceService, AttendanceCommand],
})
export class AttendanceModule {}
