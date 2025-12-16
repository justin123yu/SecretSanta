import { initDatabase } from '../lib/db';

async function main() {
  try {
    console.log('Checking database status...');
    await initDatabase();
    // initDatabase will log its own messages, so we just exit successfully
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

main();

