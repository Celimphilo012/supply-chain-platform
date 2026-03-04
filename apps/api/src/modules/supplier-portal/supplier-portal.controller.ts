import {
  Controller,
  Post,
  Get,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { SupplierPortalService } from './supplier-portal.service';
import { CreateCatalogueItemDto } from './dto/supplier-portal.dto';
import {
  InviteSupplierDto,
  AcceptInviteDto,
  SupplierLoginDto,
  AcknowledgePODto,
  UpsertCatalogueItemDto,
} from './dto/supplier-portal.dto';
import { SupplierJwtAuthGuard } from './guards/supplier-jwt.guard';

@Controller('supplier-portal')
export class SupplierPortalController {
  constructor(private service: SupplierPortalService) {}

  @Post('invite')
  @UseGuards(JwtAuthGuard)
  invite(@CurrentUser() user: User, @Body() dto: InviteSupplierDto) {
    return this.service.inviteSupplier(user.organizationId, dto);
  }

  @Post('accept-invite')
  acceptInvite(@Body() dto: AcceptInviteDto) {
    return this.service.acceptInvite(dto);
  }

  @Post('login')
  login(@Body() dto: SupplierLoginDto) {
    return this.service.login(dto);
  }

  @Get('portal')
  @UseGuards(SupplierJwtAuthGuard)
  getPortal(@Req() req: any) {
    return this.service.getPortal(req.supplierUser.id);
  }

  @Post('orders/:id/acknowledge')
  @UseGuards(SupplierJwtAuthGuard)
  acknowledgePO(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AcknowledgePODto,
  ) {
    return this.service.acknowledgePO(req.supplierUser.id, id, dto);
  }

  @Get('catalogue')
  @UseGuards(SupplierJwtAuthGuard)
  getCatalogue(@Req() req: any) {
    return this.service.getCatalogue(req.supplierUser.id);
  }

  @Post('catalogue')
  @UseGuards(SupplierJwtAuthGuard)
  createCatalogueItem(@Req() req: any, @Body() dto: CreateCatalogueItemDto) {
    return this.service.createCatalogueItem(req.supplierUser.id, dto);
  }

  @Patch('catalogue/:id')
  @UseGuards(SupplierJwtAuthGuard)
  updateCatalogueItem(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateCatalogueItemDto,
  ) {
    return this.service.updateCatalogueItem(req.supplierUser.id, id, dto);
  }

  @Delete('catalogue/:id')
  @UseGuards(SupplierJwtAuthGuard)
  deleteCatalogueItem(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.deleteCatalogueItem(req.supplierUser.id, id);
  }

  @Post('catalogue')
  @UseGuards(SupplierJwtAuthGuard)
  upsertCatalogueItem(@Req() req: any, @Body() dto: UpsertCatalogueItemDto) {
    return this.service.upsertCatalogueItem(req.supplierUser.id, dto);
  }

  @Get('notifications')
  @UseGuards(SupplierJwtAuthGuard)
  getNotifications(@Req() req: any) {
    return this.service.getNotifications(req.supplierUser.id);
  }

  @Patch('notifications/read')
  @UseGuards(SupplierJwtAuthGuard)
  markRead(@Req() req: any) {
    return this.service.markNotificationsRead(req.supplierUser.id);
  }
}
