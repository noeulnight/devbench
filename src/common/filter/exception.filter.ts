import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();
    const message = exception.message;
    const name = exception.name;

    if (status >= 500) {
      this.logger.error(
        `[${status}] ${message}`,
        exception.stack,
        HttpExceptionFilter.name,
      );
    }

    response.status(status).json({
      status,
      message,
      error: name,
    });
  }
}
