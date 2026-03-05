import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { forwardRef } from '@nestjs/common';
import { SupplierUser } from './entities/supplier-user.entity';
import { SupplierInvite } from './entities/supplier-invite.entity';
import { SupplierUserOrg } from './entities/supplier-user-org.entity';
import { SupplierNotification } from './entities/supplier-notification.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { SupplierProduct } from '../suppliers/entities/supplier-product.entity';
import { PurchaseOrder } from '../suppliers/entities/purchase-order.entity';
import { User } from '../users/entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { SupplierPortalService } from './supplier-portal.service';
import { SupplierPortalController } from './supplier-portal.controller';
import { SupplierJwtAuthGuard } from './guards/supplier-jwt.guard';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { SupplierCatalogueItem } from './entities/supplier-catalogue-item.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SupplierUser,
      SupplierInvite,
      SupplierUserOrg,
      SupplierNotification,
      Supplier,
      SupplierProduct,
      PurchaseOrder,
      User,
      Organization,
      SupplierCatalogueItem,
    ]),
    JwtModule.register({}),
    forwardRef(() => SuppliersModule),
    NotificationsModule,
  ],
  controllers: [SupplierPortalController],
  providers: [SupplierPortalService, SupplierJwtAuthGuard],
  exports: [SupplierPortalService],
})
export class SupplierPortalModule {}
