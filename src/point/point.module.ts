import { Module } from '@nestjs/common';
import { PointService } from './point.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [PrismaModule, UserModule],
  providers: [PointService],
  exports: [PointService],
})
export class PointModule {}
