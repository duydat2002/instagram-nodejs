const express = require("express");
const userController = require("@/controllers/User");
const { verifyTokenWithPermission } = require("@/middlewares/auth");
const { handleErrors } = require("@/handlers/errorHandlers");
const { upload } = require("@/handlers/firebaseUpload");

const router = express.Router();

router.get("/", verifyTokenWithPermission(false), handleErrors(userController.getAllUser));
router.get("/get-info", verifyTokenWithPermission(false), handleErrors(userController.getUser));
router.get("/:id", verifyTokenWithPermission(false), handleErrors(userController.getUserById));
router.get("/by-username/:username", handleErrors(userController.getUserByUsername));
router.patch("/:id", verifyTokenWithPermission(), upload.single("avatar"), handleErrors(userController.updateUser));
router.delete("/:id", verifyTokenWithPermission(), handleErrors(userController.deleteUser));
router.patch(
  "/:id/avatar",
  verifyTokenWithPermission(),
  upload.single("avatar"),
  handleErrors(userController.updateUserAvatar)
);
router.delete("/:id/avatar", verifyTokenWithPermission(), handleErrors(userController.deleteUserAvatar));

router.post("/:id/follow", verifyTokenWithPermission(), handleErrors(userController.followUser));
router.post("/:id/unfollow", verifyTokenWithPermission(), handleErrors(userController.unfollowUser));
router.post("/:id/mutual-follow", handleErrors(userController.getMutualFollowBy));
router.get("/:id/followers", handleErrors(userController.getFollowers));
router.get("/:id/followings", handleErrors(userController.getFollowings));

router.post(
  "/:id/upload",
  verifyTokenWithPermission(false),
  upload.any("test"),
  handleErrors(userController.uploadTest)
);

module.exports = router;
