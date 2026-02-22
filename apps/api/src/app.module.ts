import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import appConfig from './config/app.config';
import { AuthModule } from './modules/auth/auth.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { ForecastingModule } from './modules/forecasting/forecasting.module';

// add RealtimeModule to imports array

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, appConfig],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('database.url'),
        autoLoadEntities: true,
        synchronize: false,
        logging: config.get('app.nodeEnv') === 'development',
        ssl:
          config.get('app.nodeEnv') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              return `${timestamp} [${level}]: ${message} ${
                Object.keys(meta).length ? JSON.stringify(meta) : ''
              }`;
            }),
          ),
        }),
      ],
    }),
    AuthModule,
    InventoryModule,
    SuppliersModule,
    RealtimeModule,
    ForecastingModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
