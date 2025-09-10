# Notes

A simple note-taking app.

### Features

- Lightning‑fast search: case‑insensitive fuzzy search across title and content, with a looser fallback that surfaces near‑matches when results are scarce.
- AI‑powered remix: transform your notes with selectable personas (e.g., summary scholar, funny, corporate). A polished skeleton/spinner transition keeps the UI lively while generating.
- Smooth, subtle motion: cross‑page fades, a swooshy login, staggered list animations, and refined hover states for a calm, modern feel.
- Keyboard‑first workflow: create, edit, navigate, and search without leaving the keyboard (see shortcuts guide below).
- Per‑password notebooks: “your password is your login” — every password unlocks its own set of notes.

### Stack

- Backend: Node.js + Express + SQLite, TypeScript. Data layer via Sequelize ORM (SQLite dialect).
- Frontend: React + Vite + TypeScript, React Router.
- Tooling: ESLint.
- Docker: docker-compose for backend and frontend; SQLite stored on a volume.

### Dev Quickstart

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

### Auth

- Your password is your login. On first login with any password, a user is created (SHA‑256 hashed). Using the same password later unlocks that user’s notes.
- The client stores the password locally and sends it as `X-Password`.
- The backend resolves/creates a user from the password hash and scopes all notes per user.

### Docker

- docker compose up --build
- Frontend served on http://localhost:8080; backend on http://localhost:4000.
- SQLite database stored in a named volume `notes_data` mounted at `/data/notes.db` in the backend container.

### Keyboard Navigation & Shortcuts

- Notes View
  - `Ctrl/⌘ + Space`: Open “New Note” modal.
  - `Ctrl/⌘ + I`: Focus the search bar.
  - `Ctrl/⌘ + X`: Focus the first (top) note.
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
  - `Ctrl/⌘ + X` (view mode): Delete note (confirm dialog).
  - `Ctrl/⌘ + X` (edit mode): Insert Markdown code fence — adds "```javascript" before the cursor/selection and "```" after, placing the caret inside the fenced block.
  - `Esc`: Edit mode → exit edit (back to detail). View mode → back to notes list.
  - `Arrow Left`: Back to notes list (view mode).
  - Edit mode auto‑focuses the Content field and restores the last caret position per note (persisted locally). If unavailable, the caret moves to the end.
  - `Arrow Up/Down` (edit mode): Cycle focus: Title → Content → Save → Cancel (wraps).
