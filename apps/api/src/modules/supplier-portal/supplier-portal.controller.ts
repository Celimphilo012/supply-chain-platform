import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { SupplierPortalService } from './supplier-portal.service';
import {
  InviteSupplierDto,
  AcceptInviteDto,
  SupplierLoginDto,
} from './dto/supplier-portal.dto';
import { SupplierJwtAuthGuard } from './guards/supplier-jwt.guard';

@Controller('supplier-portal')
export class SupplierPortalController {
  constructor(private service: SupplierPortalService) {}

  // Org user sends invite
  @Post('invite')
  @UseGuards(JwtAuthGuard)
  invite(@CurrentUser() user: User, @Body() dto: InviteSupplierDto) {
    return this.service.inviteSupplier(user.organizationId, dto);
  }

  // Supplier accepts invite and sets password
  @Post('accept-invite')
  acceptInvite(@Body() dto: AcceptInviteDto) {
    return this.service.acceptInvite(dto);
  }

  // Supplier logs in
  @Post('login')
  login(@Body() dto: SupplierLoginDto) {
    return this.service.login(dto);
  }

  // Supplier views their portal
  @Get('portal')
  @UseGuards(SupplierJwtAuthGuard)
  getPortal(@Req() req: any) {
    return this.service.getPortal(req.supplierUser.id);
  }
}
