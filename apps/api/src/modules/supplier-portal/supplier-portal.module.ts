import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { SupplierUser } from './entities/supplier-user.entity';
import { SupplierInvite } from './entities/supplier-invite.entity';
import { SupplierUserOrg } from './entities/supplier-user-org.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { PurchaseOrder } from '../suppliers/entities/purchase-order.entity';
import { SupplierPortalService } from './supplier-portal.service';
import { SupplierPortalController } from './supplier-portal.controller';
import { SupplierJwtAuthGuard } from './guards/supplier-jwt.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SupplierUser,
      SupplierInvite,
      SupplierUserOrg,
      Supplier,
      PurchaseOrder,
    ]),
    JwtModule.register({}),
  ],
  controllers: [SupplierPortalController],
  providers: [SupplierPortalService, SupplierJwtAuthGuard],
})
export class SupplierPortalModule {}
