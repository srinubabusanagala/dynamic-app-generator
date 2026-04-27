import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load our .env file
dotenv.config();

// Create the connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// A function to automatically create our dynamic table if it doesn't exist yet
export const initDB = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS dynamic_records (
      id SERIAL PRIMARY KEY,
      entity_name VARCHAR(255) NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log("✅ PostgreSQL Database connected and tables verified.");
  } catch (err) {
    console.error("❌ Database initialization failed:", err);
  }
};