const express = require("express");
const userController = require("@/controllers/User");
const { verifyTokenWithPermission } = require("@/middlewares/auth");
const { handleErrors } = require("@/handlers/errorHandlers");
const { upload } = require("@/handlers/firebaseUpload");

const router = express.Router();

router.get("/", verifyTokenWithPermission(false), handleErrors(userController.getAllUser));
router.get("/:id", verifyTokenWithPermission(false), handleErrors(userController.getUserById));
router.patch("/:id", verifyTokenWithPermission(), upload.single("avatar"), handleErrors(userController.updateUser));
router.delete("/:id", verifyTokenWithPermission(), handleErrors(userController.deleteUser));
router.post("/:id/follow", verifyTokenWithPermission(), handleErrors(userController.followUser));
router.post("/:id/unfollow", verifyTokenWithPermission(), handleErrors(userController.unfollowUser));
router.post(
  "/:id/upload",
  verifyTokenWithPermission(false),
  upload.any("test"),
  handleErrors(userController.uploadTest)
);

module.exports = router;
