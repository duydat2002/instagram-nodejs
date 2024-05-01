const User = require("@/models/user");
const Search = require("@/models/searchHistory");
const { Types } = require("mongoose");

const searchController = {
  getSearchByUser: async (req, res) => {
    const searchs = await Search.find({ user: req.payload.id }).sort({ searchAt: -1 });

    return res.status(200).json({
      success: true,
      result: { searchs },
      message: "Successfully get search history.",
    });
  },
  searchUser: async (req, res) => {
    const { search } = req.body;
    const userId = new Types.ObjectId(req.payload.id);

    const searchs = await User.aggregate([
      {
        $match: {
          $and: [
            {
              $or: [{ username: { $regex: search, $options: "mi" } }, { fullname: { $regex: search, $options: "mi" } }],
            },
            { _id: { $ne: userId } },
          ],
        },
      },
      {
        $addFields: {
          id: "$_id",
          isFollowed: {
            $cond: [{ $in: [userId, "$followers"] }, true, false],
          },
          followOrder: {
            $cond: [
              { $eq: [userId, "$_id"] },
              0,
              {
                $cond: [
                  { $in: [userId, "$followers"] },
                  1,
                  {
                    $cond: [{ $in: [userId, "$followings"] }, 2, 3],
                  },
                ],
              },
            ],
          },
        },
      },
      {
        $sort: { followOrder: 1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      result: { searchs },
      message: "Successfully search user.",
    });
  },
  addSearchHistory: async (req, res) => {
    const { search } = req.body;
    const userId = req.payload.id;

    await Search.updateOne(
      { $and: [{ user: userId }, { search: search }] },
      { $set: { searchAt: new Date() } },
      { upsert: true }
    );

    return res.status(200).json({
      success: true,
      result: null,
      message: "Successfully add search history.",
    });
  },
  deleteSearchHistory: async (req, res) => {
    const { searchId } = req.body;
    const userId = req.payload.id;

    await Search.deleteOne({ $and: [{ user: userId }, { search: searchId }] });

    return res.status(200).json({
      success: true,
      result: null,
      message: "Successfully delete search history.",
    });
  },
  deleteAllSearchHistory: async (req, res) => {
    const userId = req.payload.id;

    await Search.deleteMany({ user: userId });

    return res.status(200).json({
      success: true,
      result: null,
      message: "Successfully delete all search history.",
    });
  },
};

module.exports = searchController;
