const isSignedIn = (req, res, next) => {
  if (req.session.employee) return next();
  res.redirect("/auth/sign-in");
};

module.exports = isSignedIn;
