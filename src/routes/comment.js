const express = require("express");
const commentController = require("@/controllers/Comment");

const router = express.Router();
const { verifyToken } = require("@/middlewares/auth");
const { handleErrors } = require("@/handlers/errorHandlers");

router.get("/", verifyToken, handleErrors(commentController.getAllComment));

module.exports = router;
