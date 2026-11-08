const Employee = require('../models/Employee')

const isAdmin = async (req, res, next) => {
const foundEmployee = await Employee.findOne({
    user: req.session.user
})
    res.locals.isAdmin = foundEmployee?.role === 'admin';
    console.log(foundEmployee);
console.log(foundEmployee?.role);
console.log(res.locals.isAdmin);
next();
};

module.exports = isAdmin;