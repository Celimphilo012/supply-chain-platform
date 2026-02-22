import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { Warehouse } from './entities/warehouse.entity';
import { Inventory } from './entities/inventory.entity';
import { InventoryTransaction } from './entities/inventory-transaction.entity';
import { ProductsService } from './services/products.service';
import { WarehousesService } from './services/warehouses.service';
import { InventoryService } from './services/inventory.service';
import { ProductsController } from './controllers/products.controller';
import { WarehousesController } from './controllers/warehouses.controller';
import { InventoryController } from './controllers/inventory.controller';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Category,
      Warehouse,
      Inventory,
      InventoryTransaction,
    ]),
    JwtModule.register({}),
    RealtimeModule,
  ],
  controllers: [ProductsController, WarehousesController, InventoryController],
  providers: [ProductsService, WarehousesService, InventoryService],
  exports: [InventoryService, ProductsService, WarehousesService],
})
export class InventoryModule {}
