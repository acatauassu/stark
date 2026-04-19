const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'stark.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'ceo',
    ap_system_prompt TEXT DEFAULT NULL,
    ap_skill_name TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Seed admin if not exists
const adminEmail = process.env.ADMIN_EMAIL || 'admin@winstark.com.br';
const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
if (!adminExists) {
  const adminPassword = process.env.ADMIN_PASSWORD || 'WinStark@2025!';
  const hash = bcrypt.hashSync(adminPassword, 10);
  db.prepare(`
    INSERT INTO users (email, password_hash, name, role)
    VALUES (?, ?, 'Administrador WIN STARK', 'admin')
  `).run(adminEmail, hash);
  console.log(`[DB] Admin criado: ${adminEmail} / ${adminPassword}`);
}

module.exports = db;
