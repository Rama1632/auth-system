const express = require("express");
const { requireAdmin } = require("../middleware/auth");
const { listUsers, updateUserProfile, deleteUser, getUserById } = require("../services/userService");

const router = express.Router();

router.use(requireAdmin);

router.get("/users", async (req, res, next) => {
  try {
    const users = await listUsers();
    return res.render("admin-users", {
      title: "User Management",
      users,
      errors: [],
      editingUser: null
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/users/:id/update", async (req, res, next) => {
  try {
    const result = await updateUserProfile(req.params.id, req.body);

    if (result.errors) {
      const users = await listUsers();
      const editingUser = await getUserById(req.params.id);
      return res.status(400).render("admin-users", {
        title: "User Management",
        users,
        errors: result.errors,
        editingUser: {
          ...(editingUser || {}),
          name: req.body.name || "",
          username: req.body.username || "",
          email: req.body.email || ""
        }
      });
    }

    req.session.flash = {
      type: "success",
      message: "User profile updated successfully."
    };
    return res.redirect("/admin/users");
  } catch (error) {
    return next(error);
  }
});

router.post("/users/:id/delete", async (req, res, next) => {
  try {
    const result = await deleteUser(req.params.id);

    if (result.errors) {
      req.session.flash = {
        type: "error",
        message: result.errors[0]
      };
      return res.redirect("/admin/users");
    }

    req.session.flash = {
      type: "success",
      message: "User removed successfully."
    };
    return res.redirect("/admin/users");
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
