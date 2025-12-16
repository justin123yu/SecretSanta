import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export const sql = neon(process.env.DATABASE_URL);

// Check if database is already initialized
async function isDatabaseInitialized(): Promise<boolean> {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as users_exists,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'assignments'
      ) as assignments_exists,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_info'
      ) as user_info_exists,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'randomizer_config'
      ) as randomizer_config_exists,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'password_reset_tokens'
      ) as password_reset_tokens_exists
    `;
    
    const row = result[0] as any;
    return (
      row.users_exists === true &&
      row.assignments_exists === true &&
      row.user_info_exists === true &&
      row.randomizer_config_exists === true &&
      row.password_reset_tokens_exists === true
    );
  } catch (error) {
    // If we can't check, assume not initialized
    return false;
  }
}

// Initialize database schema
export async function initDatabase() {
  try {
    // Check if database is already initialized
    const alreadyInitialized = await isDatabaseInitialized();
    if (alreadyInitialized) {
      console.log('Database already initialized. Skipping...');
      return;
    }

    console.log('Initializing database schema...');
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        excluded BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Add excluded column if it doesn't exist (for existing databases)
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'excluded'
        ) THEN
          ALTER TABLE users ADD COLUMN excluded BOOLEAN DEFAULT FALSE;
        END IF;
      END $$;
    `;

    // Create assignments table (stores who is assigned to whom)
    await sql`
      CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        giver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        year INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(giver_id, receiver_id, year)
      )
    `;

    // Create user_info table (stores information users provide to their partner)
    await sql`
      CREATE TABLE IF NOT EXISTS user_info (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        info_text TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create randomizer_config table (stores when randomizer should run)
    await sql`
      CREATE TABLE IF NOT EXISTS randomizer_config (
        id SERIAL PRIMARY KEY,
        assignment_date DATE NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        year INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create password_reset_tokens table
    await sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
