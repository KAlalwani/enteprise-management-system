const isAdmin = (req, res, next) => {
  if (req.session.user?.role === 'Admin') return next();
  res.status(403).send('Admins only.');
};
module.exports = isAdmin;