import { Module } from '@nestjs/common';
import { KoreanbotsService } from './koreanbots.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { XpModule } from 'src/xp/xp.module';
import { PointModule } from 'src/point/point.module';
import { KoreanbotsCommand } from './command/koreanbots.command';
@Module({
  imports: [
    PrismaModule,
    XpModule,
    PointModule,
    UserModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get('KOREANBOTS_API_URL'),
        headers: {
          Authorization: `${configService.get('KOREANBOTS_API_SECRET')}`,
        },
      }),
    }),
  ],
  providers: [KoreanbotsService, KoreanbotsCommand],
})
export class KoreanbotsModule {}
