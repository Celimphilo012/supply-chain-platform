// apps/api/src/modules/inventory/controllers/products.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserRole, User } from '../../users/entities/user.entity';
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductQueryDto } from '../dto/product-query.dto';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.MANAGER)
  create(@CurrentUser() user: User, @Body() dto: CreateProductDto) {
    return this.productsService.create(user.organizationId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User, @Query() query: ProductQueryDto) {
    return this.productsService.findAll(user.organizationId, query);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(user.organizationId, id);
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER)
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(user.organizationId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.MANAGER)
  remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(user.organizationId, id);
  }
}
