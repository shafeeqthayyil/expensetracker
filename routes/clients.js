const express = require('express');
const router = express.Router();
const db = require('../database');

// GET all clients
router.get('/', async (req, res) => {
  try {
    const clients = await db.all('SELECT * FROM clients ORDER BY created_at DESC');
    res.json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET client by ID
router.get('/:id', async (req, res) => {
  try {
    const client = await db.get('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    if (client) {
      res.json({ success: true, data: client });
    } else {
      res.status(404).json({ success: false, error: 'Client not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create new client
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    const result = await db.run(
      'INSERT INTO clients (name, email, phone, address) VALUES (?, ?, ?, ?)',
      [name, email, phone, address]
    );

    const newClient = await db.get('SELECT * FROM clients WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, data: newClient });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update client
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    const result = await db.run(
      'UPDATE clients SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
      [name, email, phone, address, req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    const updatedClient = await db.get('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updatedClient });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE client
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.run('DELETE FROM clients WHERE id = ?', [req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
