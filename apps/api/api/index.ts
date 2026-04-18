import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { IncomingMessage, ServerResponse } from 'http';
import { NestExpressApplication } from '@nestjs/platform-express';

let app: NestExpressApplication;

async function bootstrap(): Promise<NestExpressApplication> {
  const instance = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  instance.useLogger(instance.get(WINSTON_MODULE_NEST_PROVIDER));
  instance.use(helmet());
  instance.use(cookieParser());

  const config = instance.get(ConfigService);
  instance.enableCors({
    origin: config.get('app.frontendUrl'),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  instance.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  instance.setGlobalPrefix('api/v1');
  await instance.init();
  return instance;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!app) {
    app = await bootstrap();
  }
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.getInstance()(req, res);
}
