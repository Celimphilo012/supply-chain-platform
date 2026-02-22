// apps/api/src/modules/suppliers/dto/create-supplier.dto.ts
import {
  IsString,
  IsOptional,
  IsEmail,
  IsInt,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  contactName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsOptional()
  address?: Record<string, any>;

  @IsInt()
  @Min(0)
  @IsOptional()
  paymentTerms?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  leadTimeDays?: number;
}
