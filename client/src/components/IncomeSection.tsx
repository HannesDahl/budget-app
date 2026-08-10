import { useEffect, useState } from "react";

type Income = {
  id: number;
  amount: string;
  source: string;
  description: string | null;
  month: string;
};

export default function IncomeSection() {
  const [income, setIncome] = useState<Income[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [month, setMonth] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/income")
      .then((res) => {
        if (!res.ok) throw new Error("Kunde inte hämta data");
        return res.json();
      })
      .then(setIncome)
      .catch((err) => setError(err.message));
  }, []);

  async function handleSubmit() {
    try {
      const res = await fetch("http://localhost:3000/api/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, source, month }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Kunde inte spara");
      }

      const created = await res.json();
      setIncome([created, ...income]);
      setAmount("");
      setSource("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Okänt fel");
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`http://localhost:3000/api/income/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Kunde inte ta bort");
      setIncome(income.filter((i) => i.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Okänt fel");
    }
  }

  return (
    <section>
      <h2>Inkomster</h2>

      {error && <p style={{ color: "red" }}>Fel: {error}</p>}

      <div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Belopp"
        />
        <input
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Källa (CSN, Lön...)"
        />
        <input
          type="month"
          value={month.slice(0, 7)}
          onChange={(e) => setMonth(e.target.value + "-01")}
        />
        <button onClick={handleSubmit}>Lägg till</button>
      </div>

      <ul>
        {income.map((i) => (
          <li key={i.id}>
            {i.month} — {i.source}: {i.amount} kr
            <button onClick={() => handleDelete(i.id)}>Ta bort</button>
          </li>
        ))}
      </ul>
    </section>
  );
}