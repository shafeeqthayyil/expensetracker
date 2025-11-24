// Database Configuration
// Switch between SQLite and PostgreSQL

module.exports = {
  // DATABASE TYPE: 'sqlite' or 'postgres'
  DB_TYPE: process.env.DB_TYPE || 'postgres',
  
  // PostgreSQL Configuration
  POSTGRES_URL: process.env.DATABASE_URL || 'postgresql://expensetracker_165e_user:IKIswPVpDGaLKVgided7LcRF7Xp9tMql@dpg-d4i25ph5pdvs739hieog-a/expensetracker_165e',
  
  // SQLite Configuration
  SQLITE_PATH: './expense_tracker.db',
  
  // Server Configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
};
