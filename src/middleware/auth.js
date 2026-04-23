function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.session.flash = {
      type: "error",
      message: "Please log in to continue."
    };
    return res.redirect("/login");
  }

  return next();
}

function requireGuest(req, res, next) {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }

  return next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user) {
    req.session.flash = {
      type: "error",
      message: "Please log in to continue."
    };
    return res.redirect("/login");
  }

  if (req.session.user.role !== "admin") {
    req.session.flash = {
      type: "error",
      message: "You are not authorized to view that page."
    };
    return res.redirect("/dashboard");
  }

  return next();
}

module.exports = {
  requireAuth,
  requireGuest,
  requireAdmin
};
