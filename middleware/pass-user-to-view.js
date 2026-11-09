const passUserToView = (req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.isAdmin = req.session.user?.role === 'Admin';
  next();
};
module.exports = passUserToView;