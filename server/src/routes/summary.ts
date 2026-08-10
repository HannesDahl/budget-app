import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res.status(400).json({ error: "month krävs, t.ex. ?month=2026-08-01" });
  }

  try {
    const result = await pool.query(
      `SELECT
         COALESCE((SELECT SUM(amount) FROM income
                   WHERE user_id = $1 AND month = $2), 0) AS total_income,
         COALESCE((SELECT SUM(amount) FROM expenses
                   WHERE user_id = $1 AND month = $2), 0) AS total_expenses`,
      [1, month]
    );

    const { total_income, total_expenses } = result.rows[0];
    res.json({
      month,
      total_income,
      total_expenses,
      balance: Number(total_income) - Number(total_expenses),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;