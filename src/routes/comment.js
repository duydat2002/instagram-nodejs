const express = require("express");
const commentController = require("@/controllers/Comment");

const router = express.Router();
const { verifyToken } = require("@/middlewares/auth");
const { handleErrors } = require("@/handlers/errorHandlers");

router.get("/", verifyToken, handleErrors(commentController.getAllComment));
router.get("/:postId", handleErrors(commentController.getPostComments));
router.get("/:commentId/replies", verifyToken, handleErrors(commentController.getReplies));
router.get("/:commentId/likes", verifyToken, handleErrors(commentController.getLikedUsersOfComment));
router.patch("/:commentId", verifyToken, handleErrors(commentController.updateComment));
router.delete("/:commentId", verifyToken, handleErrors(commentController.deleteComment));
router.post("/:postId", verifyToken, handleErrors(commentController.commentPost));
router.post("/:commentId/reply", verifyToken, handleErrors(commentController.replyComment));
router.post("/:commentId/like", verifyToken, handleErrors(commentController.likeComment));
router.post("/:commentId/unlike", verifyToken, handleErrors(commentController.unlikeComment));

module.exports = router;
