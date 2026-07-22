import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function checkDatabaseConnection() {
  const result = await pool.query(
    'SELECT NOW() AS database_time'
  );

  return result.rows[0];
}
