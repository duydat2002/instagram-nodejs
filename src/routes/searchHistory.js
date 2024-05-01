const express = require("express");
const searchController = require("@/controllers/Search");

const router = express.Router();
const { verifyToken } = require("@/middlewares/auth");
const { handleErrors } = require("@/handlers/errorHandlers");

router.get("/get-histories", verifyToken, handleErrors(searchController.getSearchByUser));
router.post("/search-user", verifyToken, handleErrors(searchController.searchUser));
router.post("/add-history", verifyToken, handleErrors(searchController.addSearchHistory));
router.post("/delete-history", verifyToken, handleErrors(searchController.deleteSearchHistory));
router.post("/delete-all-history", verifyToken, handleErrors(searchController.deleteAllSearchHistory));

module.exports = router;
