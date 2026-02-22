// apps/api/src/modules/realtime/realtime.service.ts
import { Injectable } from '@nestjs/common';
import { InventoryGateway } from './inventory.gateway';

export interface InventoryUpdatePayload {
  productId: string;
  warehouseId: string;
  productName: string;
  quantityBefore: number;
  quantityAfter: number;
  transactionType: string;
  organizationId: string;
}

export interface AlertPayload {
  alertType: string;
  severity: string;
  message: string;
  entityId?: string;
  entityType?: string;
}

@Injectable()
export class RealtimeService {
  constructor(private inventoryGateway: InventoryGateway) {}

  emitInventoryUpdate(organizationId: string, payload: InventoryUpdatePayload) {
    this.inventoryGateway.emitToOrganization(
      organizationId,
      'inventory:updated',
      payload,
    );
  }

  emitAlert(organizationId: string, payload: AlertPayload) {
    this.inventoryGateway.emitToOrganization(
      organizationId,
      'alert:new',
      payload,
    );
  }

  emitPOStatusChange(organizationId: string, payload: any) {
    this.inventoryGateway.emitToOrganization(
      organizationId,
      'po:status_changed',
      payload,
    );
  }
}
