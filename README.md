Notes — a simple single-user note-taking app.

Features

- Notes have a title and content.
- Instant fuzzy search (debounced) across title and content.
- Clicking a note opens a dedicated URL with full content.

Stack

- Backend: Node.js + Express + SQLite (better-sqlite3), TypeScript.
- Frontend: React + Vite + TypeScript, React Router.
- Tooling: ESLint.
- Docker: docker-compose for backend and frontend; SQLite stored on a volume.

Dev Quickstart

1. Backend

- cd backend
- Copy `.env.example` to `.env` and adjust if needed
- npm install
- npm run dev

2. Frontend

- cd frontend
- npm install
- npm run dev

3. Open

- Frontend dev server on http://localhost:5173
- Backend API on http://localhost:4000/api

Auth

- Single hard-coded password used for write operations (create/update/delete).
- Default: `changeme` (override via `PASSWORD` env).
- Client sends `X-Password` header.

Docker

- docker compose up --build
- Frontend served on http://localhost:8080; backend on http://localhost:4000.
- SQLite database stored in a named volume `notes_data` mounted at `/data/notes.db` in the backend container.

Keyboard Navigation & Shortcuts

- Notes View
  - `Ctrl/⌘ + Space`: Open “New Note” modal.
  - `Ctrl/⌘ + I`: Focus the search bar.
  - `Esc`: Clear search and focus the search bar (when modal is closed).
  - `Tab`: Move focus across notes; focused note shows a ring.
  - `Arrow Up/Down`: Move focus between notes; on the top note, `Arrow Up` focuses the search bar.
  - `Space` / `Enter`: Open the focused note.
  - Focus and scroll position persist when navigating back from a note. Search text and caret position are also restored.

- Create Note Modal
  - Auto‑focus on the Title field when opened.
  - `Ctrl/⌘ + Space` or `Enter` (on Title): Create the note (if Title not empty).
  - `Esc`: Close the modal.
  - `Arrow Up/Down`: Cycle focus: Title → Content → Create → Cancel → Title (wraps).

- Note Detail
  - `Ctrl/⌘ + Space`: View mode → enter edit. Edit mode → save.
  - `Esc`: Edit mode → exit edit (back to detail). View mode → back to notes list.
  - Edit mode auto‑focuses the Content field.
  - `Arrow Up/Down` (edit mode): Cycle focus: Title → Content → Save → Cancel (wraps).
