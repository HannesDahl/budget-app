# Tally

En budgetapp jag byggde för att få ordning på min egen ekonomi. Istället för att titta på hur mycket som är kvar i slutet av månaden räknar den ut **sparkvoten** — hur stor andel av inkomsten som faktiskt gick till sparande — och visar hur den utvecklas över tid.

<img width="947" height="409" alt="Skärmbild 2026-09-01 165943" src="https://github.com/user-attachments/assets/24ebd450-ab44-4c96-a0cc-cbe22d2c1336" />

## Vad den gör

- Registrera inkomster per källa (lön, CSN, utdelning) och utgifter per kategori
- Skiljer på konsumtion och sparande, så att en ISK-insättning inte ser ut som en kostnad
- Månadsöversikt med sparkvot, nyckeltal och fördelning per kategori
- Sparkvoten över de senaste sex månaderna som trendlinje

## Stack

**Backend** — Node.js, Express, TypeScript, PostgreSQL (`pg`)
**Frontend** — React, TypeScript, Vite, React Router, Recharts
**Databas** — PostgreSQL hostad på Railway

## Kör lokalt

Kräver Node.js 20+ och en PostgreSQL-databas.

```bash
git clone https://github.com/<användarnamn>/budget-app.git
cd budget-app
```

**Databas** — skapa schemat från `server/db/schema.sql`.

**Backend:**

```bash
cd server
npm install
echo "DATABASE_URL=postgresql://user:pass@host:port/db" > .env
npm run dev
```

Servern startar på `http://localhost:3000`.

**Frontend**, i en andra terminal:

```bash
cd client
npm install
npm run dev
```

Gränssnittet ligger på `http://localhost:5173`.

## API

| Metod | Endpoint | Beskrivning |
|---|---|---|
| `GET` | `/api/income` | Alla inkomstposter |
| `POST` | `/api/income` | Skapa inkomstpost |
| `DELETE` | `/api/income/:id` | Radera inkomstpost |
| `GET` | `/api/expenses` | Alla utgiftsposter |
| `POST` | `/api/expenses` | Skapa utgiftspost |
| `DELETE` | `/api/expenses/:id` | Radera utgiftspost |
| `GET` | `/api/summary?month=` | Nyckeltal för en månad |
| `GET` | `/api/summary/range?from=&to=` | Nyckeltal per månad i ett intervall |
| `GET` | `/api/summary/categories?month=` | Utgifter grupperade per kategori |
| `GET` | `/api/summary/sources?month=` | Inkomster grupperade per källa |

## Designbeslut

**Sparande är inte en utgift.** Bokförs en ISK-insättning som en vanlig kostnad sjunker sparkvoten när man sparar mer, vilket är precis fel. Kolumnen `is_saving` på `expenses` skiljer de två, och månaden går ihop som `inkomst = konsumtion + sparande + kvar`.

**Servern avgör vad som räknas som sparande.** Klienten skickar en kategori, inte en flagga — backend slår upp `is_saving` i sin egen lista och avvisar okända kategorier. Annars skulle vem som helst kunna posta en restaurangnota som sparande och blåsa upp sin egen statistik.

**Belopp lagras som `DECIMAL` och skickas som strängar.** JavaScripts `number` är en float och kan inte representera alla decimaltal exakt, vilket är farligt för pengar. Drivrutinen konverterar därför inte automatiskt, och klienten gör det explicit vid presentation.

**Datum utan tidszon.** `pg` gör som standard om en `DATE` till ett JavaScript-`Date` och tolkar det som lokal tid, vilket flyttade `2026-08-01` till den 31 juli. En egen typparser lämnar DATE-värden som strängar — en DATE har ingen tidszon att konvertera mellan.

**Fasta kategorier istället för fritext.** Utan dem blir det "mat", "Mat" och "matvaror" på tre månader, och grupperingen per kategori tappar mening.

## Kvar att göra

- Autentisering — `user_id` är hårdkodad tills vidare
- Portföljöversikt — tabellerna `holdings` och `holding_snapshots` finns i schemat men används ännu inte
- Redigera befintliga poster (i dag går de bara att skapa och radera)
