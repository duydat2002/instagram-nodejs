const express = require("express");
const authController = require("@/controllers/Auth");

const router = express.Router();
const { verifyToken } = require("@/middlewares/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refreshToken", verifyToken, authController.refreshToken);
router.post("/logout", verifyToken, authController.logout);

module.exports = router;
