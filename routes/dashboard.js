const express = require('express');
const router = express.Router();
const db = require('../databaseUnified');

// GET dashboard statistics
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, clientId, expenseTypeId } = req.query;

    let whereConditions = [];
    let params = [];

    if (startDate) {
      whereConditions.push('income_date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      whereConditions.push('income_date <= ?');
      params.push(endDate);
    }
    if (clientId) {
      whereConditions.push('client_id = ?');
      params.push(clientId);
    }

    const incomeWhereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : '';

    // Total income
    const incomeQuery = `SELECT COALESCE(SUM(amount), 0) as total FROM income ${incomeWhereClause}`;
    const incomeResult = await db.get(incomeQuery, params);
    const totalIncome = incomeResult.total;

    // Total expenses with filters
    let expenseWhereConditions = [];
    let expenseParams = [];

    if (startDate) {
      expenseWhereConditions.push('expense_date >= ?');
      expenseParams.push(startDate);
    }
    if (endDate) {
      expenseWhereConditions.push('expense_date <= ?');
      expenseParams.push(endDate);
    }
    if (clientId) {
      expenseWhereConditions.push('client_id = ?');
      expenseParams.push(clientId);
    }
    if (expenseTypeId) {
      expenseWhereConditions.push('expense_type_id = ?');
      expenseParams.push(expenseTypeId);
    }

    const expenseWhereClause = expenseWhereConditions.length > 0 
      ? 'WHERE ' + expenseWhereConditions.join(' AND ') 
      : '';

    const expenseQuery = `SELECT COALESCE(SUM(amount), 0) as total FROM daily_expenses ${expenseWhereClause}`;
    const expenseResult = await db.get(expenseQuery, expenseParams);
    const totalExpense = expenseResult.total;

    // Calculate balance
    const balance = totalIncome - totalExpense;

    // Get expense breakdown by type
    const expenseByTypeQuery = `
      SELECT 
        et.name as expense_type,
        COALESCE(SUM(de.amount), 0) as total
      FROM expense_types et
      LEFT JOIN daily_expenses de ON et.id = de.expense_type_id ${expenseWhereConditions.length > 0 ? 'AND ' + expenseWhereConditions.join(' AND ') : ''}
      GROUP BY et.id, et.name
      ORDER BY total DESC
    `;
    const expenseByType = await db.all(expenseByTypeQuery, expenseParams);

    // Get income/expense by client
    const clientStatsQuery = `
      SELECT 
        c.id,
        c.name,
        COALESCE(SUM(i.amount), 0) as total_income,
        COALESCE(SUM(de.amount), 0) as total_expense
      FROM clients c
      LEFT JOIN income i ON c.id = i.client_id ${whereConditions.length > 0 ? 'AND ' + whereConditions.join(' AND ') : ''}
      LEFT JOIN daily_expenses de ON c.id = de.client_id ${expenseWhereConditions.length > 0 ? 'AND ' + expenseWhereConditions.join(' AND ') : ''}
      GROUP BY c.id, c.name
      HAVING total_income > 0 OR total_expense > 0
      ORDER BY (total_income - total_expense) DESC
    `;
    const clientStats = await db.all(clientStatsQuery, [...params, ...expenseParams]);

    // Recent transactions
    const recentExpensesQuery = `
      SELECT 
        de.*,
        c.name as client_name,
        et.name as expense_type_name,
        'expense' as transaction_type
      FROM daily_expenses de
      LEFT JOIN clients c ON de.client_id = c.id
      LEFT JOIN expense_types et ON de.expense_type_id = et.id
      ${expenseWhereClause}
      ORDER BY de.expense_date DESC, de.created_at DESC
      LIMIT 5
    `;
    const recentExpenses = await db.all(recentExpensesQuery, expenseParams);

    const recentIncomeQuery = `
      SELECT 
        i.*,
        c.name as client_name,
        'income' as transaction_type
      FROM income i
      LEFT JOIN clients c ON i.client_id = c.id
      ${incomeWhereClause}
      ORDER BY i.income_date DESC, i.created_at DESC
      LIMIT 5
    `;
    const recentIncome = await db.all(recentIncomeQuery, params);

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance,
        expenseByType,
        clientStats,
        recentTransactions: {
          expenses: recentExpenses,
          income: recentIncome
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
