/* ---------------------------------------------------------------------------
   Lapisan database — SQLite (via sql.js / WebAssembly, tanpa native module)
   File .sqlite disimpan di folder userData Electron sehingga persist antar
   sesi. Modul ini hanya dipakai oleh proses utama (main.js), bukan renderer.
   --------------------------------------------------------------------------- */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

let SQL = null;
let db = null;
let dbFilePath = null;

async function initDatabase(userDataPath) {
  SQL = await initSqlJs({
    locateFile: (file) => path.join(__dirname, '..', '..', 'node_modules', 'sql.js', 'dist', file),
  });

  dbFilePath = path.join(userDataPath, 'librarysys.sqlite');

  if (fs.existsSync(dbFilePath)) {
    const fileBuffer = fs.readFileSync(dbFilePath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
    persist();
  }
  return db;
}

function persist() {
  if (!db || !dbFilePath) return;
  const data = db.export();
  fs.writeFileSync(dbFilePath, Buffer.from(data));
}

function findUserByEmail(email) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
  stmt.bind([email]);
  let row = null;
  if (stmt.step()) row = stmt.getAsObject();
  stmt.free();
  return row && row.id != null ? row : null;
}

function createUser({ name, email, passwordHash }) {
  db.run('INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)', [
    name,
    email,
    passwordHash,
    new Date().toISOString(),
  ]);
  persist();
  return findUserByEmail(email);
}

function countUsers() {
  const stmt = db.prepare('SELECT COUNT(*) AS total FROM users');
  stmt.step();
  const row = stmt.getAsObject();
  stmt.free();
  return row.total || 0;
}

function findUserById(id) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
  stmt.bind([id]);
  let row = null;
  if (stmt.step()) row = stmt.getAsObject();
  stmt.free();
  return row && row.id != null ? row : null;
}

function updateUserProfile(id, { name, email }) {
  db.run('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
  persist();
  return findUserById(id);
}

function updateUserPassword(id, passwordHash) {
  db.run('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
  persist();
  return findUserById(id);
}

module.exports = {
  initDatabase,
  findUserByEmail,
  findUserById,
  createUser,
  updateUserProfile,
  updateUserPassword,
  countUsers,
};
