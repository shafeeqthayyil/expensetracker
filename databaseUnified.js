const config = require('./config');
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');

class Database {
  constructor() {
    this.dbType = config.DB_TYPE;
    this.db = null;
    this.pool = null;
  }

  async connect() {
    if (this.dbType === 'postgres') {
      return this.connectPostgres();
    } else {
      return this.connectSQLite();
    }
  }

  async connectPostgres() {
    try {
      this.pool = new Pool({
        connectionString: config.POSTGRES_URL,
        ssl: {
          rejectUnauthorized: false
        }
      });

      // Test connection
      const client = await this.pool.connect();
      console.log('✅ Connected to PostgreSQL database');
      client.release();

      await this.initializePostgresTables();
      return Promise.resolve();
    } catch (error) {
      console.error('❌ PostgreSQL connection error:', error);
      throw error;
    }
  }

  async connectSQLite() {
    return new Promise((resolve, reject) => {
      const DB_PATH = path.join(__dirname, config.SQLITE_PATH);
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('❌ SQLite connection error:', err);
          reject(err);
        } else {
          console.log('✅ Connected to SQLite database');
          this.initializeSQLiteTables()
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  }

  async initializePostgresTables() {
    const queries = [
      `CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS expense_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS daily_expenses (
        id SERIAL PRIMARY KEY,
        expense_type_id INTEGER REFERENCES expense_types(id),
        client_id INTEGER REFERENCES clients(id),
        amount DECIMAL(10, 2) NOT NULL,
        expense_date DATE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS income (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        amount DECIMAL(10, 2) NOT NULL,
        income_date DATE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const query of queries) {
      await this.pool.query(query);
    }
    console.log('✅ All PostgreSQL tables initialized');
  }

  initializeSQLiteTables() {
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
              console.error('❌ Error creating SQLite table:', err);
              reject(err);
            } else {
              completed++;
              if (completed === queries.length) {
                console.log('✅ All SQLite tables initialized');
                resolve();
              }
            }
          });
        });
      });
    });
  }

  // Unified query methods
  async run(sql, params = []) {
    if (this.dbType === 'postgres') {
      // Convert ? placeholders to $1, $2, etc for PostgreSQL
      let counter = 1;
      const pgSql = sql.replace(/\?/g, () => `$${counter++}`);
      const result = await this.pool.query(pgSql, params);
      return { 
        id: result.rows[0]?.id, 
        changes: result.rowCount 
      };
    } else {
      return new Promise((resolve, reject) => {
        this.db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, changes: this.changes });
        });
      });
    }
  }

  async get(sql, params = []) {
    if (this.dbType === 'postgres') {
      let counter = 1;
      const pgSql = sql.replace(/\?/g, () => `$${counter++}`);
      const result = await this.pool.query(pgSql, params);
      return result.rows[0];
    } else {
      return new Promise((resolve, reject) => {
        this.db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    }
  }

  async all(sql, params = []) {
    if (this.dbType === 'postgres') {
      let counter = 1;
      const pgSql = sql.replace(/\?/g, () => `$${counter++}`);
      const result = await this.pool.query(pgSql, params);
      return result.rows;
    } else {
      return new Promise((resolve, reject) => {
        this.db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    }
  }

  async close() {
    if (this.dbType === 'postgres') {
      await this.pool.end();
      console.log('✅ PostgreSQL connection closed');
    } else {
      return new Promise((resolve, reject) => {
        this.db.close((err) => {
          if (err) reject(err);
          else {
            console.log('✅ SQLite connection closed');
            resolve();
          }
        });
      });
    }
  }
}

module.exports = new Database();
