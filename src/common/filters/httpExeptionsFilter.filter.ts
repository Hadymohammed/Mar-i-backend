import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Result } from '../types/result.type';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Default to internal server error
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 500;

    // Handle NestJS HttpExceptions (BadRequestException, UnauthorizedException, etc.)
    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const responseBody = exception.getResponse();

      // Response body may be string | object
      if (typeof responseBody === 'string') {
        message = responseBody;
      } else if (typeof responseBody === 'object' && responseBody !== null) {
        message = (responseBody as any).message || message;
      }

      errorCode = status;
    }

    // For unexpected errors (TypeErrors, DB errors, Redis errors)
    else if (exception instanceof Error) {
      message = exception.message;
      errorCode = status;
    }

    const result = Result.fail(null,message, errorCode);

    response.status(status).json(result);
  }
}
