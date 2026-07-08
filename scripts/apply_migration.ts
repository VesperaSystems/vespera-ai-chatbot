import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

config({
  path: '.env.local',
});

const applyMigration = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  console.log('⏳ Applying organization fields migration...');

  try {
    // Add organization fields to User table
    await connection`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "organizationName" varchar(255);
    `;
    console.log('✅ Added organizationName column');

    await connection`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tenantType" varchar(50) DEFAULT 'finance';
    `;
    console.log('✅ Added tenantType column');

    await connection`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "organizationDomain" varchar(255);
    `;
    console.log('✅ Added organizationDomain column');

    // Add indexes
    await connection`
      CREATE INDEX IF NOT EXISTS "idx_user_tenant_type" ON "User" ("tenantType");
    `;
    console.log('✅ Added tenant type index');

    await connection`
      CREATE INDEX IF NOT EXISTS "idx_user_organization" ON "User" ("organizationName");
    `;
    console.log('✅ Added organization index');

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await connection.end();
    process.exit(0);
  }
};

applyMigration();
