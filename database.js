const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'expense_tracker.db');

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('Error connecting to database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.initializeTables()
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  }

  initializeTables() {
    const queries = [
      `CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS expense_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS daily_expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        expense_type_id INTEGER,
        client_id INTEGER,
        amount REAL NOT NULL,
        expense_date DATE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (expense_type_id) REFERENCES expense_types(id),
        FOREIGN KEY (client_id) REFERENCES clients(id)
      )`,
      `CREATE TABLE IF NOT EXISTS income (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        amount REAL NOT NULL,
        income_date DATE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id)
      )`
    ];

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('PRAGMA foreign_keys = ON');
        
        let completed = 0;
        queries.forEach((query) => {
          this.db.run(query, (err) => {
            if (err) {
              console.error('Error creating table:', err);
              reject(err);
            } else {
              completed++;
              if (completed === queries.length) {
                console.log('All tables initialized');
                resolve();
              }
            }
          });
        });
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    });
  }
}

module.exports = new Database();
