import IncomeSection from "./components/IncomeSection";
import ExpensesSection from "./components/ExpensesSection";
import Overview from "./components/Overview";

export default function App() {
  return (
    <div>
      <Overview />
      <IncomeSection />
      <ExpensesSection />
    </div>
  );
}