import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

const DB_PATH = process.env.DB_PATH || path.resolve(process.cwd(), 'data', 'notes.db');

// Ensure directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
// Users table for "password is your login" model
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    password_hash TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Ensure default user exists for backwards-compat with existing env PASSWORD
const DEFAULT_PASSWORD = process.env.PASSWORD || 'changeme';
const defaultHash = crypto.createHash('sha256').update(DEFAULT_PASSWORD).digest('hex');
let defaultUser = db.prepare('SELECT id FROM users WHERE password_hash = ?').get(defaultHash) as
  | { id: number }
  | undefined;
if (!defaultUser) {
  const info = db.prepare('INSERT INTO users (password_hash) VALUES (?)').run(defaultHash);
  defaultUser = { id: Number(info.lastInsertRowid) };
}

// Notes table with user scoping
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL DEFAULT ${defaultUser.id},
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

// Migrate legacy DBs missing user_id column
const noteCols = db.prepare("PRAGMA table_info('notes')").all() as Array<{ name: string }>;
const hasUserId = noteCols.some((c) => c.name === 'user_id');
if (!hasUserId) {
  // Add user_id with NOT NULL default to preserve existing rows
  db.exec(`ALTER TABLE notes ADD COLUMN user_id INTEGER NOT NULL DEFAULT ${defaultUser.id};`);
}
// Ensure index exists now that column is present (new or migrated DB)
db.exec(`CREATE INDEX IF NOT EXISTS idx_notes_user_updated ON notes(user_id, updated_at DESC);`);

// Seed a note if empty
const count = db.prepare('SELECT COUNT(*) as c FROM notes').get() as { c: number };
if (count.c === 0) {
  db.prepare('INSERT INTO notes (title, content, user_id) VALUES (?, ?, ?)').run(
    'Welcome to Notes',
    'This is your first note. Start typing!',
    defaultUser.id,
  );
}
