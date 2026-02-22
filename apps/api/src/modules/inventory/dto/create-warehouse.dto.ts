// apps/api/src/modules/inventory/dto/create-warehouse.dto.ts
import { IsString, IsOptional, IsObject, MaxLength } from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsObject()
  @IsOptional()
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}
