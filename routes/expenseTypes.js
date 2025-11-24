const express = require('express');
const router = express.Router();
const db = require('../databaseUnified');

// GET all expense types
router.get('/', async (req, res) => {
  try {
    const expenseTypes = await db.all('SELECT * FROM expense_types ORDER BY created_at DESC');
    res.json({ success: true, data: expenseTypes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET expense type by ID
router.get('/:id', async (req, res) => {
  try {
    const expenseType = await db.get('SELECT * FROM expense_types WHERE id = ?', [req.params.id]);
    if (expenseType) {
      res.json({ success: true, data: expenseType });
    } else {
      res.status(404).json({ success: false, error: 'Expense type not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create new expense type
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    const result = await db.run(
      'INSERT INTO expense_types (name, description) VALUES (?, ?)',
      [name, description]
    );

    const newExpenseType = await db.get('SELECT * FROM expense_types WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, data: newExpenseType });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update expense type
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    const result = await db.run(
      'UPDATE expense_types SET name = ?, description = ? WHERE id = ?',
      [name, description, req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Expense type not found' });
    }

    const updatedExpenseType = await db.get('SELECT * FROM expense_types WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updatedExpenseType });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE expense type
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.run('DELETE FROM expense_types WHERE id = ?', [req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Expense type not found' });
    }

    res.json({ success: true, message: 'Expense type deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
