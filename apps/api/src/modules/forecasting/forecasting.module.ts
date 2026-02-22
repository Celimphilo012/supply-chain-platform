import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ForecastingService } from './forecasting.service';
import { ForecastingController } from './forecasting.controller';
import { InventoryTransaction } from '../inventory/entities/inventory-transaction.entity';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([InventoryTransaction]),
    InventoryModule,
  ],
  controllers: [ForecastingController],
  providers: [ForecastingService],
  exports: [ForecastingService],
})
export class ForecastingModule {}
