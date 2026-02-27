// apps/api/src/migrations/1771700000000-AddSuperAdminRole.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSuperAdminRole1771700000000 implements MigrationInterface {
  name = 'AddSuperAdminRole1771700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add 'super_admin' to the user_role_enum
    await queryRunner.query(`
      ALTER TYPE "public"."users_role_enum"
      ADD VALUE IF NOT EXISTS 'super_admin'
    `);

    // 2. Make organization_id nullable so super_admin doesn't need an org
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "organization_id" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-add NOT NULL constraint
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "organization_id" SET NOT NULL
    `);

    // Note: PostgreSQL does not support removing enum values directly.
    // To fully revert, drop and recreate the enum without 'super_admin'.
    // This is intentionally left as a comment to avoid data loss on rollback.
  }
}
