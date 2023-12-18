const authRoutes = require("@/routes/auth");
const userRoutes = require("@/routes/user");
const postRoutes = require("@/routes/post");
const commentRoutes = require("@/routes/comment");

const routes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/comments", commentRoutes);
};

module.exports = routes;
