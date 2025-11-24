# Expense Income Tracker API

Node.js REST API for managing clients, expense types, daily expenses, and income.

## Installation

```bash
cd backend
npm install
```

## Running the Server

```bash
# Production mode
npm start

# Development mode with auto-reload
npm run dev
```

The server will run on `http://localhost:3000`

## API Endpoints

### Dashboard
- `GET /api/dashboard` - Get statistics (total income, expense, balance, breakdowns)
  - Query params: `startDate`, `endDate`, `clientId`, `expenseTypeId`

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create new client
  - Body: `{ name, email, phone, address }`
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Expense Types
- `GET /api/expense-types` - Get all expense types
- `GET /api/expense-types/:id` - Get expense type by ID
- `POST /api/expense-types` - Create new expense type
  - Body: `{ name, description }`
- `PUT /api/expense-types/:id` - Update expense type
- `DELETE /api/expense-types/:id` - Delete expense type

### Daily Expenses
- `GET /api/daily-expenses` - Get all expenses with pagination
  - Query params: `page`, `limit`, `startDate`, `endDate`, `clientId`, `expenseTypeId`
- `GET /api/daily-expenses/:id` - Get expense by ID
- `POST /api/daily-expenses` - Create new expense
  - Body: `{ expense_type_id, client_id, amount, expense_date, description }`
- `PUT /api/daily-expenses/:id` - Update expense
- `DELETE /api/daily-expenses/:id` - Delete expense

### Income
- `GET /api/income` - Get all income with pagination
  - Query params: `page`, `limit`, `startDate`, `endDate`, `clientId`
- `GET /api/income/:id` - Get income by ID
- `POST /api/income` - Create new income
  - Body: `{ client_id, amount, income_date, description }`
- `PUT /api/income/:id` - Update income
- `DELETE /api/income/:id` - Delete income

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Database

SQLite database with 4 tables:
- `clients`
- `expense_types`
- `daily_expenses`
- `income`

Database file: `expense_tracker.db` (auto-created on first run)
