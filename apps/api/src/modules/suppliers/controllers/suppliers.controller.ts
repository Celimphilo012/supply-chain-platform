// apps/api/src/modules/suppliers/controllers/suppliers.controller.ts
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
import { SuppliersService } from '../services/suppliers.service';
import { CreateSupplierDto } from '../dto/create-supplier.dto';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Post()
  @Roles(UserRole.MANAGER)
  create(@CurrentUser() user: User, @Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(user.organizationId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.suppliersService.findAll(user.organizationId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.suppliersService.findOne(user.organizationId, id);
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER)
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateSupplierDto,
  ) {
    return this.suppliersService.update(user.organizationId, id, dto);
  }

  @Get(':id/products')
  getProducts(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.suppliersService.getProducts(user.organizationId, id);
  }
}
