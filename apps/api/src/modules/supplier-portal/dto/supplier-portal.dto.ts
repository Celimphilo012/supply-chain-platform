import { IsEmail, IsString, MinLength } from 'class-validator';

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
