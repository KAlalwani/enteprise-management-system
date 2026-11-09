const bootstrapOrAdmin = (Model) => async (req, res, next) => {
  try {
    if ((await Model.countDocuments()) === 0) { req.isBootstrap = true; return next(); }
    if (req.session.user?.role === 'Admin') return next();
    res.status(403).send('Admins only.');
  } catch (err) { next(err); }
};
module.exports = bootstrapOrAdmin;