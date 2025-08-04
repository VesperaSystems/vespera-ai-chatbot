import { db } from './lib/db/index.js';
import { sql } from 'drizzle-orm';

async function checkSchema() {
  try {
    // Check if the organization fields exist in the User table
    const result = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      ORDER BY ordinal_position;
    `);

    console.log('Current User table columns:');
    result.rows.forEach((row) => {
      console.log(
        `- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`,
      );
    });

    // Check if the migration was applied
    const migrationResult = await db.execute(sql`
      SELECT * FROM "__drizzle_migrations" 
      ORDER BY created_at DESC 
      LIMIT 5;
    `);

    console.log('\nRecent migrations:');
    migrationResult.rows.forEach((row) => {
      console.log(`- ${row.id}: ${row.hash}`);
    });
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    process.exit(0);
  }
}

checkSchema();
