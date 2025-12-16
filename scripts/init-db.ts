import { initDatabase } from '../lib/db';

async function main() {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.log('⚠️  DATABASE_URL not set, skipping database initialization');
      console.log('   Database will need to be initialized manually or via API endpoint');
      process.exit(0); // Exit successfully so build doesn't fail
    }

    console.log('Checking database status...');
    await initDatabase();
    // initDatabase will log its own messages, so we just exit successfully
    process.exit(0);
  } catch (error: any) {
    // If it's a connection error, don't fail the build
    if (error.message?.includes('DATABASE_URL') || error.message?.includes('connection')) {
      console.error('⚠️  Could not connect to database during build:', error.message);
      console.log('   This is normal if DATABASE_URL is not set in build environment');
      console.log('   Database will need to be initialized manually after deployment');
      process.exit(0); // Exit successfully
    }
    
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

main();

