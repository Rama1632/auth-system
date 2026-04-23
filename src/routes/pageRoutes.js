const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { listUsers } = require("../services/userService");

const router = express.Router();

router.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }

  return res.render("index", {
    title: "Modern Auth Portal"
  });
});

router.get("/dashboard", requireAuth, async (req, res, next) => {
  try {
    let stats = null;

    if (req.session.user.role === "admin") {
      const users = await listUsers();
      stats = {
        totalUsers: users.length,
        standardUsers: users.filter((user) => user.role === "user").length
      };
    }

    return res.render("dashboard", {
      title: "Dashboard",
      stats
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
