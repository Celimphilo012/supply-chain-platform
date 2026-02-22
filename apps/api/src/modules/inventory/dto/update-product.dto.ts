// apps/api/src/modules/inventory/dto/update-product.dto.ts
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @MaxLength(100)
  @IsOptional()
  sku?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  unitOfMeasure?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  unitCost?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  sellingPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  weightKg?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
