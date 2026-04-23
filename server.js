const { app, initApp } = require("./src/app");

const port = process.env.PORT || 3000;

initApp()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start application:", error);
    process.exit(1);
  });
