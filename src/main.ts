import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AxiosExceptionFilter } from './common/filter/axios-exception.filter';
import { HttpExceptionFilter } from './common/filter/exception.filter';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { CommandExceptionFilter } from './common/filter/command.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.use(cookieParser());
  app.useGlobalFilters(
    new AxiosExceptionFilter(),
    new HttpExceptionFilter(),
    new CommandExceptionFilter(),
  );

  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT') || 3000);
}
bootstrap();
