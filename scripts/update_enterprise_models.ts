import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

config({
  path: '.env.local',
});

const updateEnterpriseModels = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  console.log('⏳ Updating enterprise subscription to include gpt-4o...');

  try {
    // Check if enterprise subscription exists
    const enterpriseSub = await connection`
      SELECT * FROM "subscription_types" WHERE "id" = 3;
    `;

    if (enterpriseSub.length === 0) {
      // Create enterprise subscription if it doesn't exist
      await connection`
        INSERT INTO "subscription_types" ("id", "name", "price", "max_messages_per_day", "available_models", "description", "is_active")
        VALUES (3, 'Enterprise', 9900, 1000, '["chat-model", "gpt-3.5", "gpt-4", "gpt-4o", "chat-model-reasoning"]', 'Enterprise plan with access to all models including GPT-4o', true);
      `;
      console.log('✅ Created enterprise subscription type');
    } else {
      // Update existing enterprise subscription to include gpt-4o
      await connection`
        UPDATE "subscription_types" 
        SET "available_models" = '["chat-model", "gpt-3.5", "gpt-4", "gpt-4o", "chat-model-reasoning"]',
            "description" = 'Enterprise plan with access to all models including GPT-4o'
        WHERE "id" = 3;
      `;
      console.log('✅ Updated enterprise subscription to include gpt-4o');
    }

    // Show all subscription types
    const allSubs = await connection`
      SELECT * FROM "subscription_types" ORDER BY "id";
    `;

    console.log('📋 All subscription types:');
    allSubs.forEach((sub: any) => {
      console.log(`  - ${sub.name} (ID: ${sub.id}): ${sub.available_models}`);
    });

    console.log('✅ Enterprise models update completed successfully!');
  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    await connection.end();
    process.exit(0);
  }
};

updateEnterpriseModels();
