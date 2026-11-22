# EXAM ARENA

Two-subject exam trainer for **TAFL (Theory of Automata & Formal Languages)** and **DAA (Design & Analysis of Algorithms)**.

- 100 generated exams per subject, 30 questions each, 30 marks, 30 minutes
- 8,000+ validated questions across 13 units and 136 question families
- Five-stage difficulty progression (Foundation → Master Arena)
- Practice mode, revision queue with spaced repetition, analytics, achievements and XP
- Per-unit cheatsheet with formulas, notes and the traps exams target
- Subject switcher that re-themes the whole interface

## Stack

React 18 · TypeScript · Vite 5 · Tailwind v4 · Framer Motion · Recharts · Zustand

## Commands

```bash
npm install
npm run dev        # local dev server
npm run typecheck  # tsc -b --noEmit
npm test           # vitest run
npm run build      # production build into dist/
```

## Content model

Question families live in `src/data/questionBank/{tafl,daa}/unit*.ts`. Each family
generates `count * 3` variants through a seeded RNG, so the bank is deterministic
and every generated option is guaranteed to be a real, distinct distractor.

Analytics helpers and generation reports:

```bash
npx vite-node scripts/subject-report.ts
npx vite-node scripts/bank-report.ts
npx vite-node scripts/filler-report.ts
```

## Cheatsheet

`src/data/cheatsheet.ts` holds the per-unit formulas and exam traps rendered at
`/cheatsheet` in the app. `CHEATSHEET.md` is generated from the same source, so the
repo copy and the app can never drift:

```bash
npx vite-node scripts/export-cheatsheet.ts
```

## Deployment

Pushes to `main` build the app and publish `dist/` to GitHub Pages through
`.github/workflows/deploy.yml`. The Vite config uses `base: './'` with a
`HashRouter`, so the project site works without any path rewriting.
