const express = require("express");
const postController = require("@/controllers/Post");

const router = express.Router();
const { verifyToken } = require("@/middlewares/auth");
const { handleErrors } = require("@/handlers/errorHandlers");
const { upload } = require("@/handlers/firebaseUpload");

router.get("/", verifyToken, handleErrors(postController.getAllPost));
router.post("/", verifyToken, upload.any("contents"), handleErrors(postController.createPost));
router.get("/:postId", verifyToken, handleErrors(postController.getPostById));
router.patch("/:postId", verifyToken, handleErrors(postController.updatePost));
router.delete("/:postId", verifyToken, handleErrors(postController.deletePost));
router.post("/:postId/like", verifyToken, handleErrors(postController.likePost));
router.post("/:postId/unlike", verifyToken, handleErrors(postController.unlikePost));
router.post("/:postId/save", verifyToken, handleErrors(postController.savePost));
router.post("/:postId/unsave", verifyToken, handleErrors(postController.unsavePost));
router.post("/:postId/tag", verifyToken, handleErrors(postController.tagPost));
router.post("/:postId/untag", verifyToken, handleErrors(postController.untagPost));
router.post("/:postId/comment", verifyToken, handleErrors(postController.commentPost));

module.exports = router;
