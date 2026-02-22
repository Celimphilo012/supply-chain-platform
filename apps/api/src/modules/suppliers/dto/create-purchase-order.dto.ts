// apps/api/src/modules/suppliers/dto/create-purchase-order.dto.ts
import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
  IsInt,
  IsNumber,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class POItemDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantityOrdered: number;

  @IsNumber()
  @Min(0)
  unitCost: number;
}

export class CreatePurchaseOrderDto {
  @IsUUID()
  supplierId: string;

  @IsUUID()
  warehouseId: string;

  @IsDateString()
  @IsOptional()
  expectedDeliveryDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => POItemDto)
  items: POItemDto[];
}
