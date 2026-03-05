import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrgNotification } from './entities/org-notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(OrgNotification)
    private notificationRepo: Repository<OrgNotification>,
  ) {}

  async getNotifications(organizationId: string, userId: string) {
    return this.notificationRepo
      .createQueryBuilder('n')
      .where('n.organization_id = :organizationId', { organizationId })
      .andWhere('(n.user_id = :userId OR n.user_id IS NULL)', { userId })
      .orderBy('n.createdAt', 'DESC')
      .take(50)
      .getMany();
  }

  async getUnreadCount(
    organizationId: string,
    userId: string,
  ): Promise<number> {
    return this.notificationRepo
      .createQueryBuilder('n')
      .where('n.organization_id = :organizationId', { organizationId })
      .andWhere('(n.user_id = :userId OR n.user_id IS NULL)', { userId })
      .andWhere('n.is_read = false')
      .getCount();
  }

  async markAllRead(organizationId: string, userId: string) {
    await this.notificationRepo
      .createQueryBuilder()
      .update(OrgNotification)
      .set({ isRead: true })
      .where('organization_id = :organizationId', { organizationId })
      .andWhere('(user_id = :userId OR user_id IS NULL)', { userId })
      .andWhere('is_read = false')
      .execute();
    return { message: 'All notifications marked as read' };
  }

  async createForOrg(data: {
    organizationId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
  }) {
    const notification = this.notificationRepo.create({
      organizationId: data.organizationId,
      userId: null, // broadcast to all org users
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data ?? {},
      isRead: false,
    });
    return this.notificationRepo.save(notification);
  }
}
