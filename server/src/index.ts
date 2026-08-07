import express from "express";
import { pool } from "./db.js";

const app = express();
app.use(express.json());

app.get("/api/income", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM income WHERE user_id = $1 ORDER BY month DESC",
      [1]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/income", async (req, res) => {
  const { amount, source, description, month } = req.body;

  if (!amount || !source || !month) {
    return res.status(400).json({ error: "amount, source och month krävs" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO income (user_id, amount, source, description, month)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [1, amount, source, description ?? null, month]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/expenses", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM expenses WHERE user_id = $1 ORDER BY month DESC",
      [1]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/expenses", async (req, res) => {
  const { amount, category, description, month } = req.body;

  if (!amount || !category || !month) {
    return res.status(400).json({ error: "amount, category och month krävs" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO expenses (user_id, amount, category, description, month)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [1, amount, category, description ?? null, month]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(3000, () => console.log("Server på http://localhost:3000"));