import IncomeSection from "./components/IncomeSection";
import ExpensesSection from "./components/ExpensesSection";

export default function App() {
  return (
    <div>
      <h1>Budget</h1>
      <IncomeSection />
      <ExpensesSection />
    </div>
  );
}