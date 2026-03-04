import { MigrationInterface, QueryRunner } from 'typeorm';

export class SupplierCatalogue1771950000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE supplier_catalogue_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        supplier_user_id UUID NOT NULL REFERENCES supplier_users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100),
        description TEXT,
        unit_cost NUMERIC(12,4) NOT NULL,
        unit VARCHAR(50),
        minimum_order_quantity INT DEFAULT 1,
        lead_time_days INT,
        is_preferred BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMPTZ DEFAULT now(),
        "updatedAt" TIMESTAMPTZ DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS supplier_catalogue_items`);
  }
}
