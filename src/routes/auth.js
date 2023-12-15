const express = require("express");
const authController = require("@/controllers/Auth");

const router = express.Router();
const { verifyToken } = require("@/middlewares/auth");
const { handleErrors } = require("@/handlers/errorHandlers");

router.post("/register", handleErrors(authController.register));
router.post("/login", handleErrors(authController.login));
router.post("/refreshToken", verifyToken, authController.refreshToken);
router.post("/logout", verifyToken, authController.logout);

module.exports = router;
