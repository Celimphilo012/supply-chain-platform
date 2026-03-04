import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Supplier } from './entities/supplier.entity';
import { SupplierProduct } from './entities/supplier-product.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { SuppliersService } from './services/suppliers.service';
import { PurchaseOrdersService } from './services/purchase-orders.service';
import { SuppliersController } from './controllers/suppliers.controller';
import { PurchaseOrdersController } from './controllers/purchase-orders.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { SupplierPortalModule } from '../supplier-portal/supplier-portal.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Supplier,
      SupplierProduct,
      PurchaseOrder,
      PurchaseOrderItem,
    ]),
    JwtModule.register({}),
    InventoryModule,
    RealtimeModule,
    forwardRef(() => SupplierPortalModule),
  ],
  controllers: [SuppliersController, PurchaseOrdersController],
  providers: [SuppliersService, PurchaseOrdersService],
  exports: [SuppliersService, PurchaseOrdersService],
})
export class SuppliersModule {}
