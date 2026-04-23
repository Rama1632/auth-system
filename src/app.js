const path = require("path");
const express = require("express");
const session = require("express-session");
const { injectViewLocals } = require("./middleware/viewLocals");
const authRoutes = require("./routes/authRoutes");
const pageRoutes = require("./routes/pageRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { ensureDataFile, ensureAdminUser } = require("./services/userService");

const app = express();
const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  app.set("trust proxy", 1);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "replace-this-with-a-secure-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

app.use((req, res, next) => {
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
});

app.use(injectViewLocals);

app.use("/", pageRoutes);
app.use("/", authRoutes);
app.use("/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).render("404", {
    title: "Page Not Found"
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).render("500", {
    title: "Something Went Wrong"
  });
});

async function initApp() {
  await ensureDataFile();
  await ensureAdminUser();
}

module.exports = {
  app,
  initApp
};
