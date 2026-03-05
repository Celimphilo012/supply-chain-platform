import { Controller, Get, Patch, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  getNotifications(@Req() req: any) {
    return this.service.getNotifications(req.user.organizationId, req.user.id);
  }

  @Get('unread-count')
  getUnreadCount(@Req() req: any) {
    return this.service.getUnreadCount(req.user.organizationId, req.user.id);
  }

  @Patch('read')
  markAllRead(@Req() req: any) {
    return this.service.markAllRead(req.user.organizationId, req.user.id);
  }
}
