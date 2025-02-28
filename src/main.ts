import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AxiosExceptionFilter } from './common/filter/axios-exception.filter';
import { HttpExceptionFilter } from './common/filter/exception.filter';
import * as cookieParser from 'cookie-parser';
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
  app.useGlobalFilters(new AxiosExceptionFilter(), new HttpExceptionFilter());

  await app.listen(3000);
}
bootstrap();
