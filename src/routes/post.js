const express = require("express");
const postController = require("@/controllers/Post");

const router = express.Router();
const { verifyToken } = require("@/middlewares/auth");
const { handleErrors } = require("@/handlers/errorHandlers");
const { upload } = require("@/handlers/firebaseUpload");

router.get("/", verifyToken, handleErrors(postController.getAllPost));
router.get("/get-posts/:userId", handleErrors(postController.getPostsByAuthor));
router.get("/get-saved-posts", verifyToken, handleErrors(postController.getSavedPosts));
router.get("/get-tagged-posts/:userId", verifyToken, handleErrors(postController.getTaggedPostsByUserId));

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

module.exports = router;
