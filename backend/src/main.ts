import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(compression());
  
  const explicitOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : [];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      // Always allow localhost dev origins
      if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
      // Always allow Vercel preview / production deployments
      if (/\.vercel\.app$/.test(origin)) return callback(null, true);
      // Allow any explicitly configured origins
      if (explicitOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin not allowed — ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Request logging middleware to help debug 404s from client browsers
  app.use((req: any, res: any, next: any) => {
    try {
      const host = req.headers['host'] || req.headers['x-forwarded-host'] || '';
      const forwardedFor = req.headers['x-forwarded-for'] || '';
      console.log('[REQ]', req.method, req.originalUrl || req.url, 'Host:', host, 'X-Forwarded-For:', forwardedFor, 'Remote:', req.socket?.remoteAddress);
    } catch (e) {
      // ignore logging errors
    }
    return next();
  });
  const httpAdapter = app.get(HttpAdapterHost);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor(), new LoggingInterceptor(), new TimeoutInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  await app.listen(3333);
  console.log('Backend is running on http://localhost:3333');
}

bootstrap();
