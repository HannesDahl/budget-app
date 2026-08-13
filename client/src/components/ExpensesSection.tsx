import { useEffect, useState } from "react";

const CATEGORIES = {
  "Utgift": ["Hyra", "Mat", "Transport", "Nöje", "Faktura", "Övrigt"],
  "Sparande": ["Buffert", "Sparkonto", "ISK"],
};

type Expense = {
  id: number;
  amount: string;
  category: string;
  description: string | null;
  month: string;
};

export default function ExpensesSection() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [month, setMonth] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/expenses")
      .then((res) => {
        if (!res.ok) throw new Error("Kunde inte hämta data");
        return res.json();
      })
      .then(setExpenses)
      .catch((err) => setError(err.message));
  }, []);

  async function handleSubmit() {
    try {
      const res = await fetch("http://localhost:3000/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, category, month }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Kunde inte spara");
      }

      const created = await res.json();
      setExpenses([created, ...expenses]);
      setAmount("");
      setCategory("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Okänt fel");
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`http://localhost:3000/api/expenses/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Kunde inte ta bort");
      setExpenses(expenses.filter((e) => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Okänt fel");
    }
  }

  return (
    <section>
      <h2>Utgifter</h2>

      {error && <p style={{ color: "red" }}>Fel: {error}</p>}

      <div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Belopp"
        />
        
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Välj kategori</option>
          {Object.entries(CATEGORIES).map(([group, items]) => (
            <optgroup key={group} label={group}>
              {items.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </optgroup>
          ))}
        </select>
        
        <input
          type="month"
          value={month.slice(0, 7)}
          onChange={(e) => setMonth(e.target.value + "-01")}
        />
        <button onClick={handleSubmit}>Lägg till</button>
      </div>

      <ul>
        {expenses.map((e) => (
          <li key={e.id}>
            {e.month} — {e.category}: {e.amount} kr
            <button onClick={() => handleDelete(e.id)}>Ta bort</button>
          </li>
        ))}
      </ul>
    </section>
  );
}