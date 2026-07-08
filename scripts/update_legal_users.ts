import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

config({
  path: '.env.local',
});

const updateLegalUsers = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  console.log('⏳ Updating legal users to enterprise access...');

  try {
    // Update all legal users to have enterprise subscription (type 3)
    const result = await connection`
      UPDATE "User" 
      SET "subscriptionType" = 3, "updatedAt" = now()
      WHERE "tenantType" = 'legal';
    `;

    console.log('✅ Updated legal users to enterprise access');

    // Show the updated users
    const legalUsers = await connection`
      SELECT "id", "email", "tenantType", "subscriptionType", "tenantId"
      FROM "User" 
      WHERE "tenantType" = 'legal';
    `;

    console.log('📋 Legal users after update:');
    legalUsers.forEach((user: any) => {
      console.log(
        `  - ${user.email}: ${user.tenantType} (subscription: ${user.subscriptionType})`,
      );
    });

    console.log('✅ Legal users update completed successfully!');
  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    await connection.end();
    process.exit(0);
  }
};

updateLegalUsers();
