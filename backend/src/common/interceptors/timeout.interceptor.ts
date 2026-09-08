import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, timeout, catchError } from 'rxjs';

/**
 * Aborts requests that run longer than TIMEOUT_MS. Kept generous so that
 * legitimately slow work (report generation, the first query against a cold
 * connection pool) is not killed with a spurious 408; genuinely hung requests
 * are still bounded.
 */
const TIMEOUT_MS = 25_000;

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(TIMEOUT_MS),
      catchError((err) => {
        if (err.name === 'TimeoutError') {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  }
}
