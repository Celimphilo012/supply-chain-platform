// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Use Winston for all NestJS internal logs
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Security headers
  app.use(helmet());

  app.use(cookieParser());

  // CORS — only allow your frontend
  const config = app.get(ConfigService);
  app.enableCors({
    origin: config.get('app.frontendUrl'),
    credentials: true, // Required for httpOnly cookies
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Global validation — rejects any request with invalid DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error if extra properties sent
      transform: true, // Auto-transform types (string "1" → number 1)
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global prefix — all routes will be /api/v1/...
  app.setGlobalPrefix('api/v1');

  const port = config.get<number>('app.port') || 3001;
  await app.listen(port);
  console.log(` API running on http://localhost:${port}/api/v1`);
}

bootstrap();
