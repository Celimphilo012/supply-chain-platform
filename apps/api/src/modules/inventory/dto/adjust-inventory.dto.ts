// apps/api/src/modules/inventory/dto/adjust-inventory.dto.ts
import {
  IsUUID,
  IsInt,
  IsEnum,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { TransactionType } from '../entities/inventory-transaction.entity';

export class AdjustInventoryDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  warehouseId: string;

  @IsInt()
  @IsNotEmpty()
  quantityDelta: number; // positive = add stock, negative = remove stock

  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  referenceId?: string;

  @IsString()
  @IsOptional()
  referenceType?: string;
}
