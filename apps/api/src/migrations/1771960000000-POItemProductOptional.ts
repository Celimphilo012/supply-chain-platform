import { MigrationInterface, QueryRunner } from 'typeorm';

export class POItemProductOptional1771960000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE purchase_order_items ALTER COLUMN product_id DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS product_name VARCHAR(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE purchase_order_items DROP COLUMN IF EXISTS product_name`,
    );
    await queryRunner.query(
      `ALTER TABLE purchase_order_items ALTER COLUMN product_id SET NOT NULL`,
    );
  }
}
