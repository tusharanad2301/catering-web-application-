// middleware/auth.js
function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) return next();
  res.redirect('/login');
}

function ensureAdmin(req, res, next) {
  if (req.session?.user?.role === 'admin') return next();
  res.status(403).send('Access denied');
}

export { ensureAuthenticated, ensureAdmin };
// Remove the require and route handlers from this middleware file.
// Route handlers should be defined in your main app file.
