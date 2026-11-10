const passUserToView = (req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.isAdmin = req.session.user?.role === 'Admin';
  res.locals.currentPath = req.path;
  next();
};
module.exports = passUserToView;