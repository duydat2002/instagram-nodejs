const userRoutes = require("@/routes/user");
const authRoutes = require("@/routes/auth");

const routes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
};

module.exports = routes;
