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

router.get("/range", async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: "from och to krävs" });
  }

  try {
    const incomeRows = await pool.query(
      `SELECT month, SUM(amount) AS total_income
       FROM income
       WHERE user_id = $1 AND month >= $2 AND month <= $3
       GROUP BY month`,
      [1, from, to]
    );

    const expenseRows = await pool.query(
      `SELECT month,
              COALESCE(SUM(amount) FILTER (WHERE NOT is_saving), 0) AS total_spent,
              COALESCE(SUM(amount) FILTER (WHERE is_saving), 0) AS total_saved
       FROM expenses
       WHERE user_id = $1 AND month >= $2 AND month <= $3
       GROUP BY month`,
      [1, from, to]
    );

    const byMonth = new Map<string, { income: number; spent: number; saved: number }>();

    for (const row of incomeRows.rows) {
      byMonth.set(row.month, { income: Number(row.total_income), spent: 0, saved: 0 });
    }

    for (const row of expenseRows.rows) {
      const entry = byMonth.get(row.month) ?? { income: 0, spent: 0, saved: 0 };
      entry.spent = Number(row.total_spent);
      entry.saved = Number(row.total_saved);
      byMonth.set(row.month, entry);
    }

    const months = [...byMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({
        month,
        total_income: v.income,
        total_spent: v.spent,
        total_saved: v.saved,
        balance: v.income - v.spent - v.saved,
        savings_rate: v.income > 0 ? v.saved / v.income : null,
      }));

    res.json(months);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/categories", async (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res.status(400).json({ error: "month krävs" });
  }

  try {
    const result = await pool.query(
      `SELECT category, is_saving, SUM(amount) AS total
       FROM expenses
       WHERE user_id = $1 AND month = $2
       GROUP BY category, is_saving
       ORDER BY total DESC`,
      [1, month]
    );

    res.json(
      result.rows.map((r) => ({
        category: r.category,
        is_saving: r.is_saving,
        total: Number(r.total),
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/sources", async (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res.status(400).json({ error: "month krävs" });
  }

  try {
    const result = await pool.query(
      `SELECT source, SUM(amount) AS total
       FROM income
       WHERE user_id = $1 AND month = $2
       GROUP BY source
       ORDER BY total DESC`,
      [1, month]
    );

    res.json(result.rows.map((r) => ({ source: r.source, total: Number(r.total) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;