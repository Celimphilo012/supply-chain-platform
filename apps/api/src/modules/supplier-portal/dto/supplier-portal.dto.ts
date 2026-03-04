import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID,
  IsIn,
  Min,
} from 'class-validator';

export class InviteSupplierDto {
  @IsEmail()
  email: string;

  @IsString()
  supplierId: string;
}

export class AcceptInviteDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}

export class SupplierLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class AcknowledgePODto {
  @IsIn(['confirm', 'reject'])
  action: 'confirm' | 'reject';

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpsertCatalogueItemDto {
  @IsUUID()
  supplierId: string;

  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(0)
  unitCost: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minimumOrderQuantity?: number;

  @IsOptional()
  @IsNumber()
  leadTimeDays?: number;

  @IsOptional()
  @IsBoolean()
  isPreferred?: boolean;
}
export class CreateCatalogueItemDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  unitCost: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minimumOrderQuantity?: number;

  @IsOptional()
  @IsNumber()
  leadTimeDays?: number;

  @IsOptional()
  @IsBoolean()
  isPreferred?: boolean;
}
