// apps/api/src/modules/forecasting/forecasting.controller.ts
import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ForecastingService } from './forecasting.service';

@Controller('forecasting')
@UseGuards(JwtAuthGuard)
export class ForecastingController {
  constructor(private forecastingService: ForecastingService) {}

  @Get(':productId')
  getForecast(
    @CurrentUser() user: User,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.forecastingService.getForecast(
      user.organizationId,
      productId,
      days,
    );
  }

  @Get(':productId/history')
  getHistory(
    @CurrentUser() user: User,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('days', new DefaultValuePipe(90), ParseIntPipe) days: number,
  ) {
    return this.forecastingService.getSalesHistory(
      user.organizationId,
      productId,
      days,
    );
  }
}
