import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = process.env.DB_PATH || path.resolve(process.cwd(), 'data', 'notes.db');

// Ensure directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TRIGGER IF NOT EXISTS trg_notes_updated
  AFTER UPDATE ON notes
  FOR EACH ROW
  BEGIN
    UPDATE notes SET updated_at = datetime('now') WHERE id = OLD.id;
  END;
`);

// Seed a note if empty
const count = db.prepare('SELECT COUNT(*) as c FROM notes').get() as { c: number };
if (count.c === 0) {
  db.prepare('INSERT INTO notes (title, content) VALUES (?, ?)').run(
    'Welcome to Notes',
    'This is your first note. Start typing!',
  );
}
