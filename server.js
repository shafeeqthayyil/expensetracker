const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config');
const db = require('./databaseUnified');

// Import routes
const clientsRouter = require('./routes/clients');
const expenseTypesRouter = require('./routes/expenseTypes');
const dailyExpensesRouter = require('./routes/dailyExpenses');
const incomeRouter = require('./routes/income');
const dashboardRouter = require('./routes/dashboard');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/clients', clientsRouter);
app.use('/api/expense-types', expenseTypesRouter);
app.use('/api/daily-expenses', dailyExpensesRouter);
app.use('/api/income', incomeRouter);
app.use('/api/dashboard', dashboardRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Expense Income Tracker API',
    version: '1.0.0',
    endpoints: {
      clients: '/api/clients',
      expenseTypes: '/api/expense-types',
      dailyExpenses: '/api/daily-expenses',
      income: '/api/income',
      dashboard: '/api/dashboard'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Initialize database and start server
db.connect()
  .then(() => {
    app.listen(config.PORT, () => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🚀 Server running on http://localhost:${config.PORT}`);
      console.log(`📊 API Documentation: http://localhost:${config.PORT}/`);
      console.log(`💚 Health Check: http://localhost:${config.PORT}/health`);
      console.log(`💾 Database: ${config.DB_TYPE.toUpperCase()}`);
      console.log(`${'='.repeat(60)}\n`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await db.close();
  process.exit(0);
});
