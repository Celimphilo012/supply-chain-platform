// apps/api/src/modules/inventory/controllers/inventory.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserRole, User } from '../../users/entities/user.entity';
import { InventoryService } from '../services/inventory.service';
import { AdjustInventoryDto } from '../dto/adjust-inventory.dto';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  getLevels(
    @CurrentUser() user: User,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.inventoryService.getInventoryLevels(
      user.organizationId,
      warehouseId,
    );
  }

  @Get('low-stock')
  getLowStock(@CurrentUser() user: User) {
    return this.inventoryService.getLowStockItems(user.organizationId);
  }

  @Post('adjust')
  @Roles(UserRole.MANAGER)
  adjust(@CurrentUser() user: User, @Body() dto: AdjustInventoryDto) {
    return this.inventoryService.adjust(user.organizationId, user.id, dto);
  }

  @Get(':productId/transactions')
  getTransactions(
    @CurrentUser() user: User,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.inventoryService.getTransactionHistory(
      user.organizationId,
      productId,
    );
  }
}
