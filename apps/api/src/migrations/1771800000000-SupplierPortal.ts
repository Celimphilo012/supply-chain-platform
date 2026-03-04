import { MigrationInterface, QueryRunner } from 'typeorm';

export class SupplierPortal1771800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE supplier_users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        last_login_at TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ DEFAULT now(),
        "updatedAt" TIMESTAMPTZ DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE supplier_invites (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        accepted BOOLEAN DEFAULT false,
        supplier_user_id UUID REFERENCES supplier_users(id),
        expires_at TIMESTAMPTZ NOT NULL,
        "createdAt" TIMESTAMPTZ DEFAULT now(),
        "updatedAt" TIMESTAMPTZ DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE supplier_user_orgs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        supplier_user_id UUID NOT NULL REFERENCES supplier_users(id) ON DELETE CASCADE,
        supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMPTZ DEFAULT now(),
        UNIQUE(supplier_user_id, supplier_id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS supplier_user_orgs`);
    await queryRunner.query(`DROP TABLE IF EXISTS supplier_invites`);
    await queryRunner.query(`DROP TABLE IF EXISTS supplier_users`);
  }
}
