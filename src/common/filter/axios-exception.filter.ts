import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { Response } from 'express';

@Catch(AxiosError)
export class AxiosExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AxiosExceptionFilter.name);

  catch(exception: AxiosError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception.response?.status || 500;
    const message = exception.message;
    const body = exception.response?.data;

    this.logger.error(
      `[${status}] ${message}`,
      exception.stack,
      AxiosExceptionFilter.name,
    );

    response.status(status).json({
      status: status,
      message: '외부 서비스에 문제가 발생했습니다.',
      error: body,
    });
  }
}
