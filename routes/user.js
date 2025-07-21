// routes/user.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db/db');

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash], (err) => {
    if (err) return res.status(500).json({ error: 'Email already exists or DB error' });
    res.redirect('/login');
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) return res.status(401).send('Invalid email or password');
    const user = results[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send('Incorrect password');

    req.session.user = user;
    res.redirect(user.role === 'admin' ? '/admin-panel' : '/dashboard');
  });
});

// Fetch products
router.get('/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(results);
  });
});

// Place order
router.post('/place-order', (req, res) => {
  const userId = req.session.user?.id;
  const cart = req.body.cart;

  if (!userId) return res.status(403).json({ error: 'Not logged in' });

  cart.forEach(item => {
    const total = item.price * item.quantity;
    db.query('INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)', 
      [userId, item.id, item.quantity, total]);
  });

  res.json({ message: 'Order placed successfully!' });
});

module.exports = router;
// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.redirect('/login');
  });
}); 