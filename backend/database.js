const Database = require('better-sqlite3');
const path = require('path');

// Create database file
const db = new Database(path.join(__dirname, 'stores.db'));

// Create stores table
db.exec(`
  CREATE TABLE IF NOT EXISTS stores (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    namespace TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL,
    helm_release TEXT NOT NULL,
    created_at TEXT NOT NULL,
    url TEXT
  )
`);

// Database operations
const storeDB = {
  // Create a new store record
  create: (store) => {
    const stmt = db.prepare(`
      INSERT INTO stores (id, name, namespace, status, helm_release, created_at, url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      store.id,
      store.name,
      store.namespace,
      store.status,
      store.helmRelease,
      store.createdAt,
      store.url || null
    );
  },

  // Get all stores
  getAll: () => {
    const stmt = db.prepare('SELECT * FROM stores ORDER BY created_at DESC');
    return stmt.all();
  },

  // Get store by ID
  getById: (id) => {
    const stmt = db.prepare('SELECT * FROM stores WHERE id = ?');
    return stmt.get(id);
  },

  // Update store status
  updateStatus: (id, status) => {
    const stmt = db.prepare('UPDATE stores SET status = ? WHERE id = ?');
    return stmt.run(status, id);
  },

  // Delete store record
  delete: (id) => {
    const stmt = db.prepare('DELETE FROM stores WHERE id = ?');
    return stmt.run(id);
  }
};

module.exports = storeDB;