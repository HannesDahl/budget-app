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
        COALESCE((SELECT SUM(amount) FILTER (WHERE NOT is_saving) FROM expenses
                  WHERE user_id = $1 AND month = $2), 0) AS total_spent,
        COALESCE((SELECT SUM(amount) FILTER (WHERE is_saving) FROM expenses
                  WHERE user_id = $1 AND month = $2), 0) AS total_saved`,
      [1, month]
    );

    const income = Number(result.rows[0].total_income);
    const spent = Number(result.rows[0].total_spent);
    const saved = Number(result.rows[0].total_saved);
    
    res.json({
      month,
      total_income: income,
      total_spent: spent,
      total_saved: saved,
      balance: income - spent - saved,
      savings_rate: income > 0 ? saved / income : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;