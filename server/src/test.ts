import { pool } from "./db.js";

const res = await pool.query("SELECT NOW()");
console.log(res.rows);
await pool.end();