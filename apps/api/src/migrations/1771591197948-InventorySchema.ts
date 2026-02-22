import { MigrationInterface, QueryRunner } from "typeorm";

export class InventorySchema1771591197948 implements MigrationInterface {
    name = 'InventorySchema1771591197948'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "warehouses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "organization_id" character varying NOT NULL, "name" character varying(255) NOT NULL, "address" jsonb, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_56ae21ee2432b2270b48867e4be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "organization_id" character varying NOT NULL, "name" character varying(255) NOT NULL, "parent_id" uuid, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "organization_id" character varying NOT NULL, "category_id" uuid, "sku" character varying(100) NOT NULL, "name" character varying(255) NOT NULL, "description" text, "unit_of_measure" character varying(50) NOT NULL DEFAULT 'units', "unit_cost" numeric(10,4), "selling_price" numeric(10,4), "weight_kg" numeric(8,3), "dimensions" jsonb, "tags" text array NOT NULL DEFAULT '{}', "is_active" boolean NOT NULL DEFAULT true, "metadata" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "inventory" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "organization_id" character varying NOT NULL, "product_id" uuid NOT NULL, "warehouse_id" uuid NOT NULL, "quantity_on_hand" integer NOT NULL DEFAULT '0', "quantity_reserved" integer NOT NULL DEFAULT '0', "quantity_incoming" integer NOT NULL DEFAULT '0', "reorder_point" integer, "reorder_quantity" integer, "max_stock_level" integer, "last_counted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "CHK_d09c2174963a95b70965032a88" CHECK ("quantity_on_hand" >= 0), CONSTRAINT "PK_82aa5da437c5bbfb80703b08309" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."inventory_transactions_transaction_type_enum" AS ENUM('receipt', 'sale', 'adjustment', 'transfer_in', 'transfer_out', 'return', 'write_off')`);
        await queryRunner.query(`CREATE TABLE "inventory_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" character varying NOT NULL, "product_id" uuid NOT NULL, "warehouse_id" uuid NOT NULL, "transaction_type" "public"."inventory_transactions_transaction_type_enum" NOT NULL, "quantity_delta" integer NOT NULL, "quantity_before" integer NOT NULL, "quantity_after" integer NOT NULL, "reference_id" character varying, "reference_type" character varying(50), "notes" text, "performed_by" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9b7144851f08f9eededde7edd42" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_88cea2dc9c31951d06437879b40" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory" ADD CONSTRAINT "FK_732fdb1f76432d65d2c136340dc" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory" ADD CONSTRAINT "FK_5d9d73a4c5fe0202714a51e4649" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory_transactions" ADD CONSTRAINT "FK_2520d97de0c9a0fbfc9b00f4c1b" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory_transactions" ADD CONSTRAINT "FK_d49bcd38118deceaeb969a54e4f" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory_transactions" ADD CONSTRAINT "FK_18dd799fc31bb0db7501ba46710" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inventory_transactions" DROP CONSTRAINT "FK_18dd799fc31bb0db7501ba46710"`);
        await queryRunner.query(`ALTER TABLE "inventory_transactions" DROP CONSTRAINT "FK_d49bcd38118deceaeb969a54e4f"`);
        await queryRunner.query(`ALTER TABLE "inventory_transactions" DROP CONSTRAINT "FK_2520d97de0c9a0fbfc9b00f4c1b"`);
        await queryRunner.query(`ALTER TABLE "inventory" DROP CONSTRAINT "FK_5d9d73a4c5fe0202714a51e4649"`);
        await queryRunner.query(`ALTER TABLE "inventory" DROP CONSTRAINT "FK_732fdb1f76432d65d2c136340dc"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_88cea2dc9c31951d06437879b40"`);
        await queryRunner.query(`DROP TABLE "inventory_transactions"`);
        await queryRunner.query(`DROP TYPE "public"."inventory_transactions_transaction_type_enum"`);
        await queryRunner.query(`DROP TABLE "inventory"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "warehouses"`);
    }

}
