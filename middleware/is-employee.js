const Employee = require('../models/Employee')

const isEmployee = async (req, res, next) => {
    const foundEmployee = await Employee.some((Employee)=> Employee.id === req.body.id)
  if (foundEmployee.CPR === req.body.CPR) return next();
  else return res.send("Not Employee");
};

module.exports = isEmployee;