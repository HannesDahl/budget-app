import { Pool } from "pg";
import "dotenv/config";
import pg from "pg";
pg.types.setTypeParser(1082, (val) => val);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});