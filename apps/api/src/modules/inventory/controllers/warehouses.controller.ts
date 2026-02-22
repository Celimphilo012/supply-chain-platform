// apps/api/src/modules/inventory/controllers/warehouses.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserRole, User } from '../../users/entities/user.entity';
import { WarehousesService } from '../services/warehouses.service';
import { CreateWarehouseDto } from '../dto/create-warehouse.dto';

@Controller('warehouses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WarehousesController {
  constructor(private warehousesService: WarehousesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@CurrentUser() user: User, @Body() dto: CreateWarehouseDto) {
    return this.warehousesService.create(user.organizationId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.warehousesService.findAll(user.organizationId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.warehousesService.findOne(user.organizationId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateWarehouseDto,
  ) {
    return this.warehousesService.update(user.organizationId, id, dto);
  }
}
