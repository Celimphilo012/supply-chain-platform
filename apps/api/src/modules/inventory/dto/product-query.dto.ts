// apps/api/src/modules/inventory/dto/product-query.dto.ts
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsUUID,
  IsInt,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class ProductQueryDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  lowStock?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @IsString()
  @IsOptional()
  cursor?: string; // last product ID for cursor pagination

  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;
}
