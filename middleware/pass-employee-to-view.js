const passEmployeeToView = (req, res, next) => {
  res.locals.employee = req.session.employee;
  next();
};

module.exports = passEmployeeToView;
