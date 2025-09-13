import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from './env.js';
import { users, rounds, tickets, winners, events, userRoles } from './schema/index.js';

async function main() {
  const sql = postgres(env.DATABASE_URL, { max: 1 });
  const db = drizzle(sql);

  console.log('🧹 Cleaning database...');
  
  try {
    // Delete records in order due to foreign key constraints
    console.log('  Deleting winners...');
    await db.delete(winners);
    
    console.log('  Deleting tickets...');
    await db.delete(tickets);
    
    console.log('  Deleting user roles...');
    await db.delete(userRoles);
    
    console.log('  Deleting rounds...');
    await db.delete(rounds);
    
    console.log('  Deleting events...');
    await db.delete(events);
    
    console.log('  Deleting users...');
    await db.delete(users);
    
    console.log('✅ Database cleaned successfully');
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error('❌ Cleanup script failed:', error);
  process.exit(1);
});