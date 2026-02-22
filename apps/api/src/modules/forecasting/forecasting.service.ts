// apps/api/src/modules/forecasting/forecasting.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import {
  InventoryTransaction,
  TransactionType,
} from '../inventory/entities/inventory-transaction.entity';

export interface ForecastPoint {
  date: string;
  predictedQuantity: number;
  lowerBound: number;
  upperBound: number;
}

@Injectable()
export class ForecastingService {
  private readonly logger = new Logger(ForecastingService.name);

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    @InjectRepository(InventoryTransaction)
    private transactionRepository: Repository<InventoryTransaction>,
  ) {}

  async getForecast(
    organizationId: string,
    productId: string,
    forecastDays = 30,
  ): Promise<ForecastPoint[]> {
    // Get historical sales data from audit log
    const history = await this.getSalesHistory(organizationId, productId, 90);

    if (history.length < 7) {
      throw new BadRequestException(
        `Insufficient sales history for product ${productId}. Need at least 7 days of data.`,
      );
    }

    const aiUrl = this.configService.get<string>('app.aiServiceUrl');

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${aiUrl}/forecast/`, {
          product_id: productId,
          historical_data: history,
          forecast_days: forecastDays,
        }),
      );

      return response.data.forecasts.map((f: any) => ({
        date: f.date,
        predictedQuantity: f.predicted_quantity,
        lowerBound: f.lower_bound,
        upperBound: f.upper_bound,
      }));
    } catch (error: any) {
      this.logger.error(`AI service error: ${error.message}`);
      throw new BadRequestException(
        `Forecast service unavailable: ${error.response?.data?.detail || error.message}`,
      );
    }
  }

  async getSalesHistory(
    organizationId: string,
    productId: string,
    days: number,
  ): Promise<{ date: string; quantity: number }[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Aggregate daily sales from the immutable audit log
    const rows = await this.transactionRepository
      .createQueryBuilder('t')
      .select("DATE_TRUNC('day', t.created_at)::date::text", 'date')
      .addSelect('SUM(ABS(t.quantity_delta))', 'quantity')
      .where('t.organization_id = :organizationId', { organizationId })
      .andWhere('t.product_id = :productId', { productId })
      .andWhere('t.transaction_type IN (:...types)', {
        types: [TransactionType.SALE, TransactionType.ADJUSTMENT],
      })
      .andWhere('t.quantity_delta < 0') // Only outbound = actual demand
      .andWhere('t.created_at >= :since', { since })
      .groupBy("DATE_TRUNC('day', t.created_at)::date::text")
      .orderBy('date', 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      date: r.date,
      quantity: parseFloat(r.quantity),
    }));
  }
}
