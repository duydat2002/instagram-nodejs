const express = require("express");
const userController = require("@/controllers/User");
const { verifyToken } = require("@/middlewares/auth");

const router = express.Router();

router.get("/", verifyToken, userController.getAllUser);
router.post("/register", verifyToken, userController.createUser);

module.exports = router;
