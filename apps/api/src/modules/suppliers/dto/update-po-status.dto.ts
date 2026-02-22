// apps/api/src/modules/suppliers/dto/update-po-status.dto.ts
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { POStatus } from '../entities/purchase-order.entity';

export class UpdatePOStatusDto {
  @IsEnum(POStatus)
  status: POStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
