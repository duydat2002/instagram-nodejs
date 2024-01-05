const express = require("express");
const authController = require("@/controllers/Auth");

const router = express.Router();
const { verifyTokenWithPermission } = require("@/middlewares/auth");
const { handleErrors } = require("@/handlers/errorHandlers");

router.post("/check-register", handleErrors(authController.checkRegister));
router.post("/register", handleErrors(authController.register));
router.post("/login", handleErrors(authController.login));
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

module.exports = router;
