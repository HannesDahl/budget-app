import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { LineChart, Line, YAxis, Dot } from "recharts";

const tokens = {
  bg: "#161826",
  surface: "#232532",
  text: "#e9e9ed",
  accent: "#9184d9",
  accent300: "#d2cefd",
  accent500: "#968ae0",
  divider: "color-mix(in srgb, #e9e9ed 16%, transparent)",
  neutral400: "#b2b6ca",
  neutral500: "#9397ab",
  neutral800: "#3f424d",
  fontHeading: '"Inter", system-ui, sans-serif',
  fontHeadingWeight: 500,
  fontBody: '"Inter", system-ui, sans-serif',
  radiusMd: "8px",
  space3: "8.4px",
};

const API = "http://localhost:3000/api/summary";

type ApiSummary = {
  month: string;
  total_income: number;
  total_spent: number;
  total_saved: number;
  balance: number;
  savings_rate: number | null;
};

type ApiCategory = { category: string; is_saving: boolean; total: number };
type ApiSource = { source: string; total: number };

const fmt = (n: number) =>
  new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(n);

const MONTH_NAMES = [
  "januari", "februari", "mars", "april", "maj", "juni",
  "juli", "augusti", "september", "oktober", "november", "december",
];

function shiftMonth(m: string, delta: number) {
  const [y, mo] = m.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1 + delta, 1)).toISOString().slice(0, 10);
}

function monthLabel(m: string) {
  const [y, mo] = m.split("-").map(Number);
  return `${MONTH_NAMES[mo - 1]} ${y}`;
}

function shortLabel(m: string) {
  return MONTH_NAMES[Number(m.split("-")[1]) - 1].slice(0, 3);
}

function currentMonth() {
  const d = new Date();
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), 1)).toISOString().slice(0, 10);
}

const styles: Record<string, CSSProperties> = {
  page: {
    background:
      "radial-gradient(1100px 640px at 88% -140px, color-mix(in srgb, #292b31 55%, transparent), transparent 62%), " +
      tokens.bg,
    minHeight: "100vh",
    fontFamily: tokens.fontBody,
    color: tokens.text,
  },
  container: {
    maxWidth: 1080,
    margin: "0 auto",
    padding: "32px clamp(20px,4vw,48px) 64px",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 36,
  },
  brand: {
    fontFamily: tokens.fontHeading,
    fontWeight: tokens.fontHeadingWeight,
    fontSize: 16,
    color: "color-mix(in srgb, #e9e9ed 70%, transparent)",
    letterSpacing: "-0.01em",
  },
  monthNav: { display: "flex", alignItems: "center", gap: 4 },
  iconBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: tokens.radiusMd,
    color: tokens.text,
    cursor: "pointer",
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: tokens.text,
    minWidth: 148,
    textAlign: "center",
    fontVariantNumeric: "tabular-nums",
  },
  sectionHero: { marginBottom: 44 },
  kicker: {
    display: "block",
    fontSize: 12,
    lineHeight: "14px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "color-mix(in srgb, #e9e9ed 55%, transparent)",
    margin: "0 0 8px",
  },
  savingsRow: { display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" },
  savingsRate: {
    fontFamily: tokens.fontHeading,
    fontWeight: tokens.fontHeadingWeight,
    fontSize: "clamp(72px,10vw,120px)",
    lineHeight: 1,
    letterSpacing: "-0.02em",
    color: tokens.text,
    fontVariantNumeric: "tabular-nums",
  },
  trend: {
    fontSize: 14,
    fontVariantNumeric: "tabular-nums",
    paddingBottom: 12,
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
  },
  sparkLabels: { display: "flex", justifyContent: "space-between", marginTop: 6, maxWidth: 480 },
  sparkLabel: { fontSize: 11, color: "color-mix(in srgb, #e9e9ed 45%, transparent)" },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0,1fr))",
    gap: 24,
    padding: "24px 0",
    borderTop: `1px solid ${tokens.divider}`,
    borderBottom: `1px solid ${tokens.divider}`,
    marginBottom: 44,
  },
  statValue: {
    display: "block",
    fontSize: 28,
    fontFamily: tokens.fontHeading,
    fontWeight: tokens.fontHeadingWeight,
    color: tokens.text,
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "-0.01em",
  },
  statLabel: {
    fontSize: 12,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "color-mix(in srgb, #e9e9ed 55%, transparent)",
  },
  breakdownRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0,7fr) minmax(0,5fr)",
    gap: 32,
    alignItems: "start",
  },
  barGroup: { display: "flex", flexDirection: "column", gap: 14 },
  barGroupSmall: { display: "flex", flexDirection: "column", gap: 12 },
  barHeaderRow: { display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 },
  barHeaderRowSmall: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 },
  barName: { color: tokens.text },
  barAmount: { fontVariantNumeric: "tabular-nums", color: "color-mix(in srgb, #e9e9ed 82%, transparent)" },
  barTrack: { height: 8, borderRadius: 4, background: tokens.neutral800, overflow: "hidden" },
  barTrackSmall: { height: 6, borderRadius: 3, background: tokens.neutral800, overflow: "hidden" },
  empty: { fontSize: 14, color: "color-mix(in srgb, #e9e9ed 45%, transparent)" },
};

export default function Overview() {
  const [month, setMonth] = useState(currentMonth);
  const [history, setHistory] = useState<ApiSummary[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [sources, setSources] = useState<ApiSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const from = shiftMonth(month, -5);

    Promise.all([
      fetch(`${API}/range?from=${from}&to=${month}`).then((r) => r.json()),
      fetch(`${API}/categories?month=${month}`).then((r) => r.json()),
      fetch(`${API}/sources?month=${month}`).then((r) => r.json()),
    ])
      .then(([range, cats, srcs]) => {
        if (cancelled) return;
        setHistory(range);
        setCategories(cats);
        setSources(srcs);
        setError(null);
      })
      .catch(() => !cancelled && setError("Kunde inte hämta data"))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [month]);

  const cur = history.find((h) => h.month === month);
  const prev = history.find((h) => h.month === shiftMonth(month, -1));

  const rate = cur?.savings_rate != null ? Math.round(cur.savings_rate * 100) : null;
  const prevRate = prev?.savings_rate != null ? Math.round(prev.savings_rate * 100) : null;
  const delta = rate != null && prevRate != null ? rate - prevRate : null;
  const trendUp = (delta ?? 0) >= 0;

  const trendColor =
    delta == null
      ? "color-mix(in srgb, #e9e9ed 55%, transparent)"
      : trendUp
      ? tokens.accent300
      : "color-mix(in srgb, #e9e9ed 60%, transparent)";

  const trendLabel =
    delta == null
      ? "ingen jämförelse"
      : `${Math.abs(delta)} p.e. mot förra månaden`;

  const chartData = history.map((h) => ({
    month: h.month,
    rate: h.savings_rate != null ? Math.round(h.savings_rate * 100) : 0,
  }));
  const curIndex = chartData.findIndex((d) => d.month === month);

  const expenseCategories = categories.filter((c) => !c.is_saving);
  const savingCategories = categories.filter((c) => c.is_saving);
  const maxExpense = expenseCategories[0]?.total ?? 1;
  const maxSaving = savingCategories[0]?.total ?? 1;
  const maxSource = sources[0]?.total ?? 1;

  const renderDot = (props: { cx?: number; cy?: number; index?: number }) => {
    const { cx, cy, index } = props;
    const isCurrent = index === curIndex;
    return (
      <Dot
        key={`dot-${index}`}
        cx={cx}
        cy={cy}
        r={isCurrent ? 4 : 2.5}
        fill={isCurrent ? tokens.accent : tokens.neutral500}
        stroke="none"
      />
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <span style={styles.brand}>Tally</span>
          <div style={styles.monthNav}>
            <button
              type="button"
              aria-label="Föregående månad"
              onClick={() => setMonth(shiftMonth(month, -1))}
              style={styles.iconBtn}
            >
              <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
                <path d="M7 1L1 6L7 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span style={styles.monthLabel}>{monthLabel(month)}</span>
            <button
              type="button"
              aria-label="Nästa månad"
              onClick={() => setMonth(shiftMonth(month, 1))}
              style={styles.iconBtn}
            >
              <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
                <path d="M1 1L7 6L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {error && <p style={{ color: "#f87171" }}>{error}</p>}

        <section style={styles.sectionHero}>
          <span style={styles.kicker}>Sparkvot</span>
          <div style={styles.savingsRow}>
            <span style={styles.savingsRate}>{rate != null ? `${rate}%` : "–"}</span>
            <span style={{ ...styles.trend, color: trendColor }}>
              {delta != null && (
                <svg
                  width="10" height="10" viewBox="0 0 10 10" fill="none"
                  style={{ transform: trendUp ? "rotate(0deg)" : "rotate(180deg)", flexShrink: 0 }}
                >
                  <path d="M5 1L5 9M5 1L1.5 4.5M5 1L8.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {trendLabel}
            </span>
          </div>

          {chartData.length > 1 && (
            <>
              <div style={{ marginTop: 12 }}>
                <LineChart width={480} height={48} data={chartData} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
                  <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
                  <Line type="monotone" dataKey="rate" stroke={tokens.accent} strokeWidth={2} dot={renderDot} isAnimationActive={false} />
                </LineChart>
              </div>
              <div style={styles.sparkLabels}>
                {chartData.map((d) => (
                  <span key={d.month} style={styles.sparkLabel}>{shortLabel(d.month)}</span>
                ))}
              </div>
            </>
          )}
        </section>

        <section style={styles.statsRow}>
          <div>
            <span style={styles.statValue}>{fmt(cur?.total_income ?? 0)}</span>
            <span style={styles.statLabel}>Inkomst</span>
          </div>
          <div>
            <span style={styles.statValue}>{fmt(cur?.total_spent ?? 0)}</span>
            <span style={styles.statLabel}>Utgifter</span>
          </div>
          <div>
            <span style={styles.statValue}>{fmt(cur?.total_saved ?? 0)}</span>
            <span style={styles.statLabel}>Sparat</span>
          </div>
          <div>
            <span style={styles.statValue}>{fmt(cur?.balance ?? 0)}</span>
            <span style={styles.statLabel}>Kvar</span>
          </div>
        </section>

        <section style={styles.breakdownRow}>
          <div>
            <span style={styles.kicker}>Utgifter per kategori</span>
            <div style={styles.barGroup}>
              {expenseCategories.length === 0 && !loading && (
                <span style={styles.empty}>Inga utgifter den här månaden.</span>
              )}
              {expenseCategories.map((c) => (
                <div key={c.category}>
                  <div style={styles.barHeaderRow}>
                    <span style={styles.barName}>{c.category}</span>
                    <span style={styles.barAmount}>{fmt(c.total)}</span>
                  </div>
                  <div style={styles.barTrack}>
                    <div style={{ height: "100%", borderRadius: 4, width: `${Math.round((c.total / maxExpense) * 100)}%`, background: tokens.neutral400 }} />
                  </div>
                </div>
              ))}
            </div>

            {savingCategories.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <span style={styles.kicker}>Sparande</span>
                <div style={styles.barGroup}>
                  {savingCategories.map((c) => (
                    <div key={c.category}>
                      <div style={styles.barHeaderRow}>
                        <span style={styles.barName}>{c.category}</span>
                        <span style={styles.barAmount}>{fmt(c.total)}</span>
                      </div>
                      <div style={styles.barTrack}>
                        <div style={{ height: "100%", borderRadius: 4, width: `${Math.round((c.total / maxSaving) * 100)}%`, background: tokens.accent500 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <span style={styles.kicker}>Inkomst per källa</span>
            <div style={styles.barGroupSmall}>
              {sources.length === 0 && !loading && (
                <span style={styles.empty}>Inga inkomster den här månaden.</span>
              )}
              {sources.map((s) => (
                <div key={s.source}>
                  <div style={styles.barHeaderRowSmall}>
                    <span style={styles.barName}>{s.source}</span>
                    <span style={styles.barAmount}>{fmt(s.total)}</span>
                  </div>
                  <div style={styles.barTrackSmall}>
                    <div style={{ height: "100%", borderRadius: 3, width: `${Math.round((s.total / maxSource) * 100)}%`, background: tokens.neutral500 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}