const express = require("express");
const { requireGuest } = require("../middleware/auth");
const { createUser, authenticateUser } = require("../services/userService");

const router = express.Router();

router.get("/login", requireGuest, (req, res) => {
  res.render("login", {
    title: "Login",
    formData: {
      identity: ""
    },
    errors: []
  });
});

router.get("/signup", requireGuest, (req, res) => {
  res.render("signup", {
    title: "Create Account",
    formData: {
      name: "",
      username: "",
      email: ""
    },
    errors: []
  });
});

router.post("/signup", requireGuest, async (req, res, next) => {
  try {
    const formData = {
      name: req.body.name || "",
      username: req.body.username || "",
      email: req.body.email || ""
    };

    const result = await createUser({
      ...req.body
    });

    if (result.errors) {
      return res.status(400).render("signup", {
        title: "Create Account",
        formData,
        errors: result.errors
      });
    }

    req.session.flash = {
      type: "success",
      message: "Registration successful. Please sign in with your new account."
    };
    return res.redirect("/login");
  } catch (error) {
    return next(error);
  }
});

router.post("/login", requireGuest, async (req, res, next) => {
  try {
    const identity = (req.body.identity || "").trim();
    const password = req.body.password || "";
    const user = await authenticateUser(identity, password);

    if (!user) {
      return res.status(401).render("login", {
        title: "Login",
        formData: {
          identity
        },
        errors: ["Invalid email/username or password."]
      });
    }

    req.session.user = user;
    req.session.flash = {
      type: "success",
      message: `Welcome back, ${user.name}.`
    };
    return res.redirect("/dashboard");
  } catch (error) {
    return next(error);
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
