import { useEffect, useState } from "react";

type Income = {
  id: number;
  amount: string;
  source: string;
  description: string | null;
  month: string;
};

export default function App() {
  const [income, setIncome] = useState<Income[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/income")
      .then((res) => {
        if (!res.ok) throw new Error("Kunde inte hämta data");
        return res.json();
      })
      .then(setIncome)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p>Fel: {error}</p>;

  return (
    <div>
      <h1>Inkomster</h1>
      <ul>
        {income.map((i) => (
          <li key={i.id}>
            {i.month} — {i.source}: {i.amount} kr
          </li>
        ))}
      </ul>
    </div>
  );
}