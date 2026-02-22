import { MigrationInterface, QueryRunner } from "typeorm";

export class SuppliersSchema1771597974023 implements MigrationInterface {
    name = 'SuppliersSchema1771597974023'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "suppliers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "organization_id" character varying NOT NULL, "name" character varying(255) NOT NULL, "contact_name" character varying(255), "email" character varying(255), "phone" character varying(50), "address" jsonb, "payment_terms" integer NOT NULL DEFAULT '30', "lead_time_days" integer, "reliability_score" numeric(3,2), "is_active" boolean NOT NULL DEFAULT true, "metadata" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_b70ac51766a9e3144f778cfe81e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "supplier_products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "supplier_id" uuid NOT NULL, "product_id" uuid NOT NULL, "organization_id" character varying NOT NULL, "unit_cost" numeric(10,4) NOT NULL, "minimum_order_quantity" integer NOT NULL DEFAULT '1', "lead_time_days" integer, "is_preferred" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_651e91706e362ef7393457c347e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "purchase_order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "purchase_order_id" uuid NOT NULL, "product_id" uuid NOT NULL, "quantity_ordered" integer NOT NULL, "quantity_received" integer NOT NULL DEFAULT '0', "unit_cost" numeric(10,4) NOT NULL, CONSTRAINT "PK_e8b7568d25c41e3290db596b312" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."purchase_orders_status_enum" AS ENUM('draft', 'pending_approval', 'approved', 'sent', 'partial', 'received', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "purchase_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "organization_id" character varying NOT NULL, "supplier_id" uuid NOT NULL, "warehouse_id" uuid NOT NULL, "po_number" character varying(100) NOT NULL, "status" "public"."purchase_orders_status_enum" NOT NULL DEFAULT 'draft', "total_amount" numeric(12,4), "currency" character varying(3) NOT NULL DEFAULT 'USD', "expected_delivery_date" date, "actual_delivery_date" date, "notes" text, "approved_by" uuid, "approved_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid, CONSTRAINT "UQ_74065a5d2b8c4c14b8b8fcf0159" UNIQUE ("po_number"), CONSTRAINT "PK_05148947415204a897e8beb2553" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "supplier_products" ADD CONSTRAINT "FK_4286173e1486a5c528f89dc798c" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "supplier_products" ADD CONSTRAINT "FK_9ff2b133160a708a047cbce49d2" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_order_items" ADD CONSTRAINT "FK_3f92bb44026cedfe235c8b91244" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_order_items" ADD CONSTRAINT "FK_d5089517fc19b1b9fb04454740c" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" ADD CONSTRAINT "FK_d16a885aa88447ccfd010e739b0" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" ADD CONSTRAINT "FK_74e4ce03ba3f8bc13de20fc594e" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" ADD CONSTRAINT "FK_396e7d9c9ddef24e5af83a23316" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" ADD CONSTRAINT "FK_99f44faa1ca8d7ec9ebef918b06" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_orders" DROP CONSTRAINT "FK_99f44faa1ca8d7ec9ebef918b06"`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" DROP CONSTRAINT "FK_396e7d9c9ddef24e5af83a23316"`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" DROP CONSTRAINT "FK_74e4ce03ba3f8bc13de20fc594e"`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" DROP CONSTRAINT "FK_d16a885aa88447ccfd010e739b0"`);
        await queryRunner.query(`ALTER TABLE "purchase_order_items" DROP CONSTRAINT "FK_d5089517fc19b1b9fb04454740c"`);
        await queryRunner.query(`ALTER TABLE "purchase_order_items" DROP CONSTRAINT "FK_3f92bb44026cedfe235c8b91244"`);
        await queryRunner.query(`ALTER TABLE "supplier_products" DROP CONSTRAINT "FK_9ff2b133160a708a047cbce49d2"`);
        await queryRunner.query(`ALTER TABLE "supplier_products" DROP CONSTRAINT "FK_4286173e1486a5c528f89dc798c"`);
        await queryRunner.query(`DROP TABLE "purchase_orders"`);
        await queryRunner.query(`DROP TYPE "public"."purchase_orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "purchase_order_items"`);
        await queryRunner.query(`DROP TABLE "supplier_products"`);
        await queryRunner.query(`DROP TABLE "suppliers"`);
    }

}
