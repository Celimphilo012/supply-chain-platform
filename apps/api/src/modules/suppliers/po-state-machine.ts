// apps/api/src/modules/suppliers/po-state-machine.ts
import { BadRequestException } from '@nestjs/common';
import { POStatus } from './entities/purchase-order.entity';

const VALID_TRANSITIONS: Record<POStatus, POStatus[]> = {
  [POStatus.DRAFT]: [POStatus.PENDING_APPROVAL, POStatus.CANCELLED],
  [POStatus.PENDING_APPROVAL]: [
    POStatus.APPROVED,
    POStatus.DRAFT,
    POStatus.CANCELLED,
  ],
  [POStatus.APPROVED]: [POStatus.SENT, POStatus.CANCELLED],
  [POStatus.SENT]: [
    POStatus.CONFIRMED,
    POStatus.REJECTED,
    POStatus.PARTIAL,
    POStatus.RECEIVED,
    POStatus.CANCELLED,
  ],
  [POStatus.CONFIRMED]: [
    POStatus.PARTIAL,
    POStatus.RECEIVED,
    POStatus.CANCELLED,
  ],
  [POStatus.REJECTED]: [],
  [POStatus.PARTIAL]: [POStatus.RECEIVED, POStatus.CANCELLED],
  [POStatus.RECEIVED]: [],
  [POStatus.CANCELLED]: [],
};

export function validateTransition(from: POStatus, to: POStatus): void {
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new BadRequestException(
      `Invalid status transition: "${from}" → "${to}". Allowed: [${allowed.join(', ') || 'none'}]`,
    );
  }
}
