# Notes Project — Agent Guide

This document explains the repo structure, coding style, conventions, and daily workflows so agents can contribute quickly and consistently.

## Overview

- Single‑user notes app with fuzzy search and a clean, dark UI.
- Backend: Node + Express + SQLite (better‑sqlite3), TypeScript.
- Frontend: Vite + React + TypeScript, Tailwind CSS, Framer Motion, React Router.
- Auth: Hard‑coded password. Client stores it in `localStorage` and sends it as `X-Password`.
- Containerization: Dockerfiles for frontend and backend; `docker-compose.yml` for local runs.

## Repository Layout

- `backend/`
  - `src/server.ts`: Express app and routes (`/api/health`, `/api/auth`, `/api/notes` CRUD + search).
  - `src/notes.ts`: Note CRUD and fuzzy ranking.
  - `src/db.ts`: SQLite init, schema and triggers, WAL, seed note.
  - `src/types.ts`: Shared backend types.
  - `.eslintrc.cjs`, `tsconfig.json`, `.env.example`, `Dockerfile`.
- `frontend/`
  - `src/main.tsx`: Router + Auth provider bootstrap.
  - `src/pages/`: `Home.tsx`, `NoteDetail.tsx`, `Login.tsx`.
  - `src/components/`: `SearchBar.tsx`, `NotesList.tsx`, `Note.tsx`.
  - `src/auth/`: `AuthContext.tsx`, `RequireAuth.tsx`.
  - `src/config/`: `animations.ts`, `styles.ts` (central motion presets + Tailwind tokens).
  - `src/hooks/`: `useDebounce.ts`.
  - `src/api.ts`: API wrapper; pulls `VITE_API_BASE` or uses `/api`.
  - Tailwind + Vite config: `tailwind.config.cjs`, `postcss.config.cjs`, `vite.config.ts`.
  - `Dockerfile`, `index.html`.
- Root
  - `package.json` (workspaces + scripts), `.prettierrc.json`, `.prettierignore`, `docker-compose.yml`, `README.md`.

## Coding Style & Guidelines

- Language: TypeScript everywhere. Strict mode on. Avoid `any`.
- Functions/components: Prefer `const` arrow functions for consistency.
- Types:
  - Define DB row shapes (e.g., `NoteRow`) and map to API types.
  - Exported API types: `Note`, `NoteListItem` on the client; keep server types separate.
- Modern syntax: Use optional chaining, nullish coalescing, template strings, destructuring.
- Immutability: Avoid mutating props/state/params; favor new objects/arrays.
- Errors: Return proper HTTP codes; client should surface friendly messages.
- File naming:
  - React components: `PascalCase.tsx` in `components/` or `pages/`.
  - Hooks: `camelCase.ts` in `hooks/` and start with `use`.
  - Config/tokens: Centralized in `src/config/*`.
- Styling:
  - Tailwind classes only; do not inline style objects (unless unavoidable).
  - Reuse tokens from `styles.ts` and spread animation presets from `animations.ts`.
  - Dark, rounded, minimal; thin headlines (`font-extralight`) and subtle motion.
- Animations (Framer Motion):
  - Use exported presets: `pageEnter`, `headlineEnter`, `cardItem`, `inputFocus`, `buttonHoverTap`.
  - Favor quick, subtle transitions. Respect reduced motion if added later.
- Auth:
  - Password lives in `localStorage` under `password`.
  - All requests include `X-Password` header (see `api.ts`).
  - Guard routes with `RequireAuth`; Login writes password after `/api/auth` confirms.
- Search:
  - Use backend fuzzy ranking for results; client debounces queries.

## Scripts & Tooling

- Root scripts
  - `npm run dev:backend` — start Express in watch mode.
  - `npm run dev:frontend` — start Vite dev server.
  - `npm run build` — build backend and frontend.
  - `npm run lint` — run ESLint in both workspaces.
  - `npm run format` / `format:check` — Prettier.
- Linting
  - ESLint config per package; TS parser and strict rules (no unused, no `any`).
  - Fix issues as you go; do not disable rules unless justified.
- Formatting
  - Prettier v3 with standard options; run `npm run format` prior to commits/PRs.

## Development Workflow

1. Install: `npm install --workspaces`.
2. Run dev servers: `npm run dev:backend` and `npm run dev:frontend`.
3. Before pushing:
   - `npm run format` (required)
   - `npm run lint` (must pass)
4. Optional: `docker compose up --build` for an end‑to‑end test.

## Extension Ideas

- Add route‑level `<AnimatePresence mode="wait">` for cross‑page fades.
- SQLite FTS5 for search with ranking instead of JS fuzzy.
- Reduced motion support in `animations.ts`.
- Basic tests for search and CRUD.

---

Keep components lean by pushing repeated classes/animations into `src/config`. Always lint and format before opening PRs.
