# Podium (werktitel)

Een schaalbaar, sport-onafhankelijk voorspelplatform — vergelijkbaar met
Scorito, maar niet gebouwd voor één toernooi. Het datamodel ondersteunt
elke sport, elk niveau en elke competitie (officieel of zelf aangemaakt)
zonder dat de code opnieuw gebouwd hoeft te worden.

De naam "Podium" is een tijdelijke werktitel — makkelijk aan te passen
(zie "Wat kan je makkelijk zelf aanpassen" onderaan).

Dit is een **werkend prototype**: de volledige flow — competitie kiezen,
betalen, poules maken, voorspellen, klassement, admin — draait op mock
data die in de browser wordt bijgehouden (`localStorage`), zodat je alles
kan uitproberen zonder eerst Supabase of Mollie te koppelen.

## Het idee

- Launch-competitie: **WK Hockey 2026**. Eenmalig €4 toegang, en je kan
  vervolgens onbeperkt gratis poules maken met vrienden, familie of
  collega's, én je staat automatisch op de officiële landelijke ranglijst.
- Daarna: dezelfde architectuur werkt voor de **Hoofdklasse Hockey**
  (al aangemaakt als "binnenkort"), en voor **elke andere competitie of
  sport** — gebruikers kunnen zelf een competitie aanmaken (teams
  handmatig of via CSV) voor hun eigen vriendengroep, klasse of bedrijf,
  in elke sport.
- **Bedrijven** kunnen in één keer betalen voor het hele team — daarna
  spelen medewerkers gratis mee met een eigen bedrijfs-leaderboard.
- Bij het betalen van de toegangsprijs kan je optioneel een extra bedrag
  toevoegen om het teamfonds van **Oranje-Rood Dames 1** te steunen — laagdrempelig,
  niet als apart "donatie"-thema maar als onderdeel van dezelfde betaalstap.
- De focus ligt op voorspellen en het "kennerschap" van je eigen team,
  club of vriendengroep — niet op gokken. Er wordt geen geld uitgekeerd
  vanuit inleg; eventuele prijzen (clinics, tickets, shirts) worden apart
  door de beheerder toegevoegd.

## Wat zit erin

- Homepage: uitleg, uitgelichte + officiële competities, login/registratie.
- Competitie-hub per competitie: betaalscherm (eenmalige toegang + optionele
  steun + bedrijfsoptie) of, als je al toegang hebt, je poules + gratis
  "nieuwe poule maken".
- Bedrijven: eigen poule aanmaken, code delen, medewerkers wisselen de
  code in voor gratis toegang.
- Eigen competitie aanmaken: elke sport, teams handmatig of via CSV-upload.
- Pouledetail: ranglijst, deelnemers, wedstrijden (met voorspellen +
  automatisch sluiten bij aftrap), regels (aanpasbaar puntensysteem),
  statistieken.
- Profiel: badges/achievements en voorspelhistorie (client-side afgeleid
  uit de data, geen aparte tabellen nodig).
- Admin-dashboard: competities, sporten, teams, wedstrijden/uitslagen,
  puntensysteem, bedrijven, sponsoren, prijzen, gebruikers, poules.
- Nederlands / Engels (next-intl), dark mode, PWA (installeerbaar,
  offline-shell via een service worker), mobile-first responsive design.

## Lokaal draaien

```bash
npm install
npm run dev
```

Open <http://localhost:3000> (redirect naar `/nl`). Inloggen kan met elk
e-mailadres — demo-login, geen echt account.

Snelle test:
1. Log in.
2. Dashboard → je zit al in de officiële WK-poule + een demo-kantoorpoule.
3. Ga naar de WK Hockey-competitiepagina → zie het betaalscherm (als je
   uitlogt/nieuw account maakt) of je poules (met het demo-account).
4. Open een poule → tab "Wedstrijden" → voorspel een nog niet gestarte
   wedstrijd. Tab "Regels" (als eigenaar) → pas het puntensysteem aan.
5. Probeer "Maak je eigen competitie" op de homepage — voeg teams toe
   via het formulier of upload een CSV (`Teamnaam,Land` per regel).
6. `/admin` (ingelogd als "Niels") → voer een uitslag in → ranglijst
   wordt automatisch herberekend.

## Projectstructuur

```
src/
  app/[locale]/            Pagina's (App Router, per taal)
    competitions/          Competitie-hub (betalen/poules) + eigen competitie aanmaken
    pools/                 Poule aanmaken/joinen/detail
    admin/                 Beheerdashboard
  components/
    ui/                    Basis UI-componenten
    pool/                  Ranglijst, wedstrijden, regels, statistieken
    admin/                 Admin-tabbladen
  data/mock-data.ts         Voorbeelddata: sporten, competities, teams, wedstrijden, gebruikers
  lib/
    scoring.ts              Puntentelling + leaderboard-logica (puur, testbaar)
    store.ts                 Client state (zustand + localStorage) — vervangt hier de backend
    pool-helpers.ts           Afgeleide data + toegangscontrole per competitie
    achievements.ts           Badges, afgeleid uit dezelfde data
  types/index.ts             Centrale TypeScript-datamodellen (sport-onafhankelijk)
db/
  schema.sql                 Supabase/Postgres-schema, 1-op-1 op src/types
messages/
  nl.json, en.json           Vertalingen
public/
  manifest.json, sw.js, icons/   PWA-bestanden
```

## Wat is er nu al gebouwd (deze pas), en wat is bewust nog roadmap

**Gebouwd, werkt in de browser:**
- Generiek sport/competitie/team/wedstrijd-model (niet hockey-specifiek).
- Twee officiële competities (WK Hockey actief, Hoofdklasse "binnenkort")
  + een zelf-aangemaakte competitie als bewijs dat het generiek werkt.
- Betaalflow (gesimuleerd): eenmalige toegang per competitie + optionele
  steun-bedrag, met een aparte bedrijfsroute (bulk-toegang + eigen poule).
- Eigen competitie aanmaken (handmatig of CSV-teams).
- Volledig werkende voorspellingen, puntentelling, ranglijst, statistieken,
  badges en voorspelhistorie.
- Uitgebreid admin-dashboard.

**Bewust nog niet gebouwd (vraagt echte accounts/infrastructuur):**
- **Mollie/iDEAL/Apple Pay/Google Pay/Bancontact** — nu een gesimuleerde
  betaalknop. Zie hieronder voor de exacte vervolgstappen.
- **Supabase** — alles draait nu op `localStorage`. `db/schema.sql` staat
  al klaar.
- **Officiële API-koppelingen** (bijv. hockey.nl) — nu handmatige invoer/CSV.
- **Echte pushmeldingen/e-mails** — nu een statische voorbeeld-dropdown.
- **Native iOS/Android apps** — de PWA is nu het installeerbare pad.
- **Robuuste Excel (.xlsx)** — nu CSV-parsing; .xlsx kan later server-side
  met een library als `xlsx` worden toegevoegd.

## Volgende stappen richting productie

### 1. Supabase (database + auth)
1. Maak een project op <https://supabase.com>, voer `db/schema.sql` uit.
2. Zet Supabase Auth aan.
3. Vervang de functies in `src/lib/store.ts` door Supabase-queries.
4. Voeg `.env.local` toe met `NEXT_PUBLIC_SUPABASE_URL` en
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 2. Mollie (iDEAL / Apple Pay / Google Pay / Bancontact / creditcard)
`src/components/PaymentButton.tsx` bevat nu een gesimuleerde betaling.
In productie: server route die een Mollie Payment aanmaakt met de
gekozen betaalmethode, een webhook die `competition_access` bijwerkt
zodra de betaling is bevestigd, en dezelfde flow voor bedrijfsbetalingen
(bedrag = toegangsprijs × aantal medewerkers).

## Wat kan je makkelijk zelf aanpassen

- **Naam "Podium"** → in `messages/nl.json` en `en.json` (`Common.appName`),
  `package.json`, `public/manifest.json`.
- **Teksten (NL/EN)** → `messages/nl.json` / `en.json`.
- **Kleuren** → `src/app/globals.css`.
- **Competities/teams/wedstrijden/toegangsprijs/steunbedrag-doel** →
  `src/data/mock-data.ts`.
- **Puntensysteem, uitslagen, gebruikers** → al live aan te passen in de
  app zelf via het Admin-dashboard.

## Techniek

Next.js (App Router) · TypeScript · Tailwind CSS v4 · next-intl (NL/EN)
· zustand (client state, met localStorage-persistentie ter vervanging
van een backend in dit prototype) · PWA (manifest + service worker).
