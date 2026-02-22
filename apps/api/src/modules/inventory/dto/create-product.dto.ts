// apps/api/src/modules/inventory/dto/create-product.dto.ts
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

export class CreateProductDto {
  @IsString()
  @MaxLength(100)
  sku: string;

  @IsString()
  @MaxLength(255)
  name: string;

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
}
