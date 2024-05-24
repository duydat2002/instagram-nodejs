const express = require("express");
const chatController = require("@/controllers/Chat");

const router = express.Router();
const { verifyToken } = require("@/middlewares/auth");
const { handleErrors } = require("@/handlers/errorHandlers");

router.get("/get-conversations", verifyToken, handleErrors(chatController.getConvesations));
router.post("/create-conversation", verifyToken, handleErrors(chatController.createConversation));
router.post("/:conversationId/add-people", verifyToken, handleErrors(chatController.addPeopleToConversation));
router.post("/:conversationId/delete-people", verifyToken, handleErrors(chatController.deletePeopleFromConversation));
router.get("/:conversationId/get-messages", verifyToken, handleErrors(chatController.getMessagesInChat));
router.post("/:conversationId/send-message", verifyToken, handleErrors(chatController.sendMessage));

module.exports = router;
