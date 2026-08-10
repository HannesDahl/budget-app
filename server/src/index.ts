import express from "express";
import incomeRouter from "./routes/income.js";
import expensesRouter from "./routes/expenses.js";
import summaryRouter from "./routes/summary.js";
import cors from "cors";

const app = express();
app.use(express.json());

app.use(cors({ origin: "http://localhost:5173" }));

app.use("/api/income", incomeRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/summary", summaryRouter);

app.listen(3000, () => console.log("Server på http://localhost:3000"));