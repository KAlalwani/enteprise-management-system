const Employee = require('../models/Employee')

const isAdmin = async (req, res, next) => {
const foundEmployee = await Employee.findOne({
    user: req.session.user._id
})
    res.locals.isAdmin = foundEmployee?.role === 'Admin';
next();
};

module.exports = isAdmin;