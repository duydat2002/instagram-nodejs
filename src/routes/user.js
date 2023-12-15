const express = require("express");
const userController = require("@/controllers/User");
const { verifyToken } = require("@/middlewares/auth");
const { handleErrors } = require("@/handlers/errorHandlers");
const { upload } = require("@/handlers/firebaseUpload");

const router = express.Router();

router.get("/", verifyToken, handleErrors(userController.getAllUser));
router.get("/:username", verifyToken, handleErrors(userController.getUserByUsername));
router.patch(
  "/:username",
  verifyToken,
  upload.single("avatar"),
  handleErrors(userController.updateUser)
);
router.delete("/:username", verifyToken, handleErrors(userController.deleteUser));
router.post("/:username/follow", verifyToken, handleErrors(userController.followUser));
router.post("/:username/unfollow", verifyToken, handleErrors(userController.unfollowUser));
router.post(
  "/:username/upload",
  verifyToken,
  upload.single("test"),
  handleErrors(userController.uploadTest)
);

module.exports = router;
