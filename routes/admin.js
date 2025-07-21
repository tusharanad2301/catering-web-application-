// routes/admin.js
const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Add new product
router.post('/add-product', (req, res) => {
  const { name, description, price, image } = req.body;
  const userId = req.session.user?.id;

  if (!userId || req.session.user.role !== 'admin') {
    return res.status(403).send('Access Denied');
  }

  db.query('INSERT INTO products (name, description, price, image, created_by) VALUES (?, ?, ?, ?, ?)',
    [name, description, price, image, userId],
    (err) => {
      if (err) return res.status(500).send('Database error');
      res.redirect('/admin-panel');
    });
});

// View orders
router.get('/orders', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).send('Access Denied');
  }

  db.query(
    `SELECT o.id, u.name AS customer, p.name AS product, o.quantity, o.total_price, o.status, o.order_date 
     FROM orders o 
     JOIN users u ON o.user_id = u.id 
     JOIN products p ON o.product_id = p.id`,
    (err, results) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json(results);
    }
  );
});

module.exports = router;
// Delete product
router.post('/delete-product/:id', (req, res) => {
  const productId = req.params.id;
  const userId = req.session.user?.id;

  if (!userId || req.session.user.role !== 'admin') {
    return res.status(403).send('Access Denied');
  }

  db.query('DELETE FROM products WHERE id = ? AND created_by = ?', [productId, userId], (err) => {
    if (err) return res.status(500).send('Database error');
    res.redirect('/admin-panel');
  });
});
// Update product
router.post('/update-product/:id', (req, res) => {
  const productId = req.params.id;
  const { name, description, price, image } = req.body;
  const userId = req.session.user?.id;

  if (!userId || req.session.user.role !== 'admin') {
    return res.status(403).send('Access Denied');
  }

  db.query('UPDATE products SET name = ?, description = ?, price = ?, image = ? WHERE id = ? AND created_by = ?',
    [name, description, price, image, productId, userId],
    (err) => {
      if (err) return res.status(500).send('Database error');
      res.redirect('/admin-panel');
    });
});
// View users
router.get('/users', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).send('Access Denied');
  }

  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(results);
  });
});
// Update user role
router.post('/update-user-role/:id', (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;
  const adminId = req.session.user?.id;

  if (!adminId || req.session.user.role !== 'admin') {
    return res.status(403).send('Access Denied');
  }

  db.query('UPDATE users SET role = ? WHERE id = ? AND id != ?', [role, userId, adminId], (err) => {
    if (err) return res.status(500).send('Database error');
    res.redirect('/admin-panel');
  });
});
// View dashboard
router.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.status(403).send('Access Denied');
  }

  res.render('dashboard', { user: req.session.user });
});