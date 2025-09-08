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
