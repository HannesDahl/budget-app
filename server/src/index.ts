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

app.listen(3000, () => console.log("Server på http://localhost:3000"));