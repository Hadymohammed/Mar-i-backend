// convert response to result<T> 
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Result } from '../types/result.type';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Result<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Result<T>> {

    return next.handle().pipe(
       map((data) => {
        // Already a Result
        if (data instanceof Result) return data;
        // Otherwise wrap it
        return Result.ok(data);
      }),
    );
  }
}