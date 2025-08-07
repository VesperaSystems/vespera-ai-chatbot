import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

config({
  path: '.env.local',
});

const applyTenantMigration = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  console.log('⏳ Applying tenant table migration...');

  try {
    // Create Tenant table
    await connection`
      CREATE TABLE IF NOT EXISTS "Tenant" (
        "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(255) NOT NULL,
        "domain" varchar(255),
        "tenantType" varchar(50) NOT NULL DEFAULT 'quant',
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      );
    `;
    console.log('✅ Created Tenant table');

    // Add tenantId column to User table
    await connection`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tenantId" uuid REFERENCES "Tenant"("id");
    `;
    console.log('✅ Added tenantId column to User table');

    // Create indexes
    await connection`
      CREATE INDEX IF NOT EXISTS "idx_user_tenant_id" ON "User" ("tenantId");
    `;
    console.log('✅ Created user tenant index');

    await connection`
      CREATE INDEX IF NOT EXISTS "idx_tenant_name" ON "Tenant" ("name");
    `;
    console.log('✅ Created tenant name index');

    await connection`
      CREATE INDEX IF NOT EXISTS "idx_tenant_type" ON "Tenant" ("tenantType");
    `;
    console.log('✅ Created tenant type index');

    // Create default tenant
    await connection`
      INSERT INTO "Tenant" ("name", "domain", "tenantType") 
      VALUES ('Default Organization', 'default', 'quant')
      ON CONFLICT DO NOTHING;
    `;
    console.log('✅ Created default tenant');

    // Create X4Group tenant
    await connection`
      INSERT INTO "Tenant" ("name", "domain", "tenantType") 
      VALUES ('X4Group', 'thex4group.com', 'legal')
      ON CONFLICT DO NOTHING;
    `;
    console.log('✅ Created X4Group tenant');

    // Update legal@thex4group.com to be part of X4Group
    await connection`
      UPDATE "User" 
      SET "tenantId" = (SELECT "id" FROM "Tenant" WHERE "name" = 'X4Group')
      WHERE "email" = 'legal@thex4group.com';
    `;
    console.log('✅ Updated legal@thex4group.com to X4Group tenant');

    // Update other users to default tenant if they don't have a tenant
    await connection`
      UPDATE "User" 
      SET "tenantId" = (SELECT "id" FROM "Tenant" WHERE "name" = 'Default Organization')
      WHERE "tenantId" IS NULL;
    `;
    console.log('✅ Updated other users to default tenant');

    console.log('✅ Tenant migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await connection.end();
    process.exit(0);
  }
};

applyTenantMigration();
