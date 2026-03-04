import { MigrationInterface, QueryRunner } from 'typeorm';

export class SupplierPortalFeatures1771900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "public"."purchase_orders_status_enum"
      ADD VALUE IF NOT EXISTS 'confirmed';
    `);
    await queryRunner.query(`
      ALTER TYPE "public"."purchase_orders_status_enum"
      ADD VALUE IF NOT EXISTS 'rejected';
    `);
    await queryRunner.query(`
      CREATE TABLE supplier_notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        supplier_user_id UUID NOT NULL REFERENCES supplier_users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSONB DEFAULT '{}',
        is_read BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMPTZ DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS supplier_notifications`);
  }
}
