const express = require('express');
const router = express.Router();
const db = require('../database');

// GET all income with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      startDate, 
      endDate, 
      clientId 
    } = req.query;

    const offset = (page - 1) * limit;
    
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

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM income ${whereClause}`;
    const countResult = await db.get(countQuery, params);
    const total = countResult.total;

    // Get paginated data with joins
    const dataQuery = `
      SELECT 
        i.*,
        c.name as client_name
      FROM income i
      LEFT JOIN clients c ON i.client_id = c.id
      ${whereClause}
      ORDER BY i.income_date DESC, i.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const incomeRecords = await db.all(dataQuery, [...params, parseInt(limit), offset]);

    res.json({
      success: true,
      data: incomeRecords,
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

// GET income by ID
router.get('/:id', async (req, res) => {
  try {
    const query = `
      SELECT 
        i.*,
        c.name as client_name
      FROM income i
      LEFT JOIN clients c ON i.client_id = c.id
      WHERE i.id = ?
    `;
    
    const income = await db.get(query, [req.params.id]);
    
    if (income) {
      res.json({ success: true, data: income });
    } else {
      res.status(404).json({ success: false, error: 'Income not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create new income
router.post('/', async (req, res) => {
  try {
    const { client_id, amount, income_date, description } = req.body;
    
    if (!amount || !income_date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Amount and income date are required' 
      });
    }

    const result = await db.run(
      `INSERT INTO income 
       (client_id, amount, income_date, description) 
       VALUES (?, ?, ?, ?)`,
      [client_id, amount, income_date, description]
    );

    const newIncome = await db.get(
      `SELECT i.*, c.name as client_name
       FROM income i
       LEFT JOIN clients c ON i.client_id = c.id
       WHERE i.id = ?`,
      [result.id]
    );
    
    res.status(201).json({ success: true, data: newIncome });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update income
router.put('/:id', async (req, res) => {
  try {
    const { client_id, amount, income_date, description } = req.body;
    
    if (!amount || !income_date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Amount and income date are required' 
      });
    }

    const result = await db.run(
      `UPDATE income 
       SET client_id = ?, amount = ?, income_date = ?, description = ? 
       WHERE id = ?`,
      [client_id, amount, income_date, description, req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Income not found' });
    }

    const updatedIncome = await db.get(
      `SELECT i.*, c.name as client_name
       FROM income i
       LEFT JOIN clients c ON i.client_id = c.id
       WHERE i.id = ?`,
      [req.params.id]
    );
    
    res.json({ success: true, data: updatedIncome });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE income
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.run('DELETE FROM income WHERE id = ?', [req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Income not found' });
    }

    res.json({ success: true, message: 'Income deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
