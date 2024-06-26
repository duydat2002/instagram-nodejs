const authRoutes = require("@/routes/auth");
const userRoutes = require("@/routes/user");
const postRoutes = require("@/routes/post");
const commentRoutes = require("@/routes/comment");
const searchRoutes = require("@/routes/searchHistory");
const chatRoutes = require("@/routes/chat");

const routes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/comments", commentRoutes);
  app.use("/api/search", searchRoutes);
  app.use("/api/chat", chatRoutes);
};

module.exports = routes;
