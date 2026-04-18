// apps/api/src/modules/realtime/realtime.service.ts
import { Injectable } from '@nestjs/common';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitInventoryUpdate(_organizationId: string, _payload: InventoryUpdatePayload) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitAlert(_organizationId: string, _payload: AlertPayload) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitPOStatusChange(_organizationId: string, _payload: any) {}
}
