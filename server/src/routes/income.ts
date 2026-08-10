import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
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

router.post("/", async (req, res) => {
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

export default router;