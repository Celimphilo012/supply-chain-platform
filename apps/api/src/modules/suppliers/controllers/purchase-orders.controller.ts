// apps/api/src/modules/suppliers/controllers/purchase-orders.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
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
import { PurchaseOrdersService } from '../services/purchase-orders.service';
import { CreatePurchaseOrderDto } from '../dto/create-purchase-order.dto';
import { UpdatePOStatusDto } from '../dto/update-po-status.dto';
import { ReceivePODto } from '../dto/receive-po.dto';
import { POStatus } from '../entities/purchase-order.entity';

@Controller('purchase-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PurchaseOrdersController {
  constructor(private poService: PurchaseOrdersService) {}

  @Post()
  @Roles(UserRole.MANAGER)
  create(@CurrentUser() user: User, @Body() dto: CreatePurchaseOrderDto) {
    return this.poService.create(user.organizationId, user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User, @Query('status') status?: POStatus) {
    return this.poService.findAll(user.organizationId, status);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.poService.findOne(user.organizationId, id);
  }

  @Patch(':id/status')
  @Roles(UserRole.MANAGER)
  updateStatus(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePOStatusDto,
  ) {
    return this.poService.updateStatus(user.organizationId, id, user.id, dto);
  }

  @Post(':id/receive')
  @Roles(UserRole.MANAGER)
  receive(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReceivePODto,
  ) {
    return this.poService.receive(user.organizationId, id, user.id, dto);
  }
}
