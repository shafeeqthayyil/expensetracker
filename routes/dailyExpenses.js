const express = require('express');
const router = express.Router();
const db = require('../databaseUnified');

// GET all daily expenses with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      startDate, 
      endDate, 
      clientId, 
      expenseTypeId 
    } = req.query;

    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    let params = [];

    if (startDate) {
      whereConditions.push('expense_date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      whereConditions.push('expense_date <= ?');
      params.push(endDate);
    }
    if (clientId) {
      whereConditions.push('client_id = ?');
      params.push(clientId);
    }
    if (expenseTypeId) {
      whereConditions.push('expense_type_id = ?');
      params.push(expenseTypeId);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM daily_expenses ${whereClause}`;
    const countResult = await db.get(countQuery, params);
    const total = countResult.total;

    // Get paginated data with joins
    const dataQuery = `
      SELECT 
        de.*,
        c.name as client_name,
        et.name as expense_type_name
      FROM daily_expenses de
      LEFT JOIN clients c ON de.client_id = c.id
      LEFT JOIN expense_types et ON de.expense_type_id = et.id
      ${whereClause}
      ORDER BY de.expense_date DESC, de.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const expenses = await db.all(dataQuery, [...params, parseInt(limit), offset]);

    res.json({
      success: true,
      data: expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET expense by ID
router.get('/:id', async (req, res) => {
  try {
    const query = `
      SELECT 
        de.*,
        c.name as client_name,
        et.name as expense_type_name
      FROM daily_expenses de
      LEFT JOIN clients c ON de.client_id = c.id
      LEFT JOIN expense_types et ON de.expense_type_id = et.id
      WHERE de.id = ?
    `;
    
    const expense = await db.get(query, [req.params.id]);
    
    if (expense) {
      res.json({ success: true, data: expense });
    } else {
      res.status(404).json({ success: false, error: 'Expense not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create new expense
router.post('/', async (req, res) => {
  try {
    const { expense_type_id, client_id, amount, expense_date, description } = req.body;
    
    if (!amount || !expense_date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Amount and expense date are required' 
      });
    }

    const result = await db.run(
      `INSERT INTO daily_expenses 
       (expense_type_id, client_id, amount, expense_date, description) 
       VALUES (?, ?, ?, ?, ?)`,
      [expense_type_id, client_id, amount, expense_date, description]
    );

    const newExpense = await db.get(
      `SELECT de.*, c.name as client_name, et.name as expense_type_name
       FROM daily_expenses de
       LEFT JOIN clients c ON de.client_id = c.id
       LEFT JOIN expense_types et ON de.expense_type_id = et.id
       WHERE de.id = ?`,
      [result.id]
    );
    
    res.status(201).json({ success: true, data: newExpense });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update expense
router.put('/:id', async (req, res) => {
  try {
    const { expense_type_id, client_id, amount, expense_date, description } = req.body;
    
    if (!amount || !expense_date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Amount and expense date are required' 
      });
    }

    const result = await db.run(
      `UPDATE daily_expenses 
       SET expense_type_id = ?, client_id = ?, amount = ?, 
           expense_date = ?, description = ? 
       WHERE id = ?`,
      [expense_type_id, client_id, amount, expense_date, description, req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    const updatedExpense = await db.get(
      `SELECT de.*, c.name as client_name, et.name as expense_type_name
       FROM daily_expenses de
       LEFT JOIN clients c ON de.client_id = c.id
       LEFT JOIN expense_types et ON de.expense_type_id = et.id
       WHERE de.id = ?`,
      [req.params.id]
    );
    
    res.json({ success: true, data: updatedExpense });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE expense
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.run('DELETE FROM daily_expenses WHERE id = ?', [req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
