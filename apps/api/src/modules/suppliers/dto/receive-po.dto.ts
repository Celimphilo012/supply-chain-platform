// apps/api/src/modules/suppliers/dto/receive-po.dto.ts
import { IsArray, ValidateNested, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ReceiveItemDto {
  @IsUUID()
  purchaseOrderItemId: string;

  @IsInt()
  @Min(0)
  quantityReceived: number;
}

export class ReceivePODto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiveItemDto)
  items: ReceiveItemDto[];
}
