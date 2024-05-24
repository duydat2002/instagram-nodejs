const User = require("@/models/user");
const Message = require("@/models/message");
const Conversation = require("@/models/conversation");

const chatController = {
  getConvesations: async (req, res) => {
    const conversations = await Conversation.find({ members: { $elemMatch: { $eq: req.payload.id } } }).sort({
      updatedAt: -1,
    });

    return res.status(200).json({
      success: true,
      result: { conversations },
      message: "Successfully get user conversations.",
    });
  },
  createConversation: async (req, res) => {
    const userId = req.payload.id;
    const { type, members, groupName } = req.body;

    if (type == "duo" || members?.length == 2) {
      let conversation = await Conversation.findOne({ type, members: { $all: members } });
      if (conversation)
        return res.status(400).json({
          success: false,
          result: null,
          message: "This conversation already exists.",
        });
    }

    conversation = new Conversation({ type, members });
    if (type == "group" && members && members?.length > 2) {
      conversation.type = "group";
      conversation.groupName = groupName;
    } else {
      conversation.type = "duo";
    }

    await conversation.save();

    return res.status(200).json({
      success: true,
      result: { conversation },
      message: "Successfully create conversation.",
    });
  },
  addPeopleToConversation: async (req, res) => {
    const conversationId = req.params.conversationId;
    const { people } = req.body;

    if (!people || people?.length < 1)
      return res.status(400).json({
        success: false,
        result: null,
        message: "People is not defined.",
      });

    const conversation = await Conversation.findOneAndUpdate(
      { _id: conversationId, type: "group" },
      {
        $addToSet: { members: { $each: people } },
      },
      {
        new: true,
      }
    );

    if (!conversation)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found conversation.",
      });

    return res.status(200).json({
      success: true,
      result: { conversation },
      message: "Successfully add people to conversation.",
    });
  },
  deletePeopleFromConversation: async (req, res) => {
    const conversationId = req.params.conversationId;
    const { people } = req.body;

    if (!people || people.length < 1)
      return res.status(400).json({
        success: false,
        result: null,
        message: "People is not defined.",
      });

    const conversation = await Conversation.findOneAndUpdate(
      { _id: conversationId, type: "group" },
      {
        $pull: { members: { $in: people } },
      },
      {
        new: true,
      }
    );

    if (!conversation)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found conversation.",
      });

    return res.status(200).json({
      success: true,
      result: { conversation },
      message: "Successfully delete people to conversation.",
    });
  },
  getMessagesInChat: async (req, res) => {
    const conversationId = req.params.conversationId;
    let { start, pageSize } = req.query;
    start = isNaN(parseInt(start)) ? 0 : parseInt(start);
    pageSize = isNaN(parseInt(pageSize)) ? 30 : parseInt(pageSize);

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .skip(start)
      .limit(pageSize);

    return res.status(200).json({
      success: true,
      result: { messages },
      message: "Successfully get messages in conversation.",
    });
  },
  sendMessage: async (req, res) => {
    const conversationId = req.params.conversationId;
    const { type, content, replyTo } = req.body;

    const message = new Message({
      conversation: conversationId,
      author: req.payload.id,
      type,
      content,
      replyTo,
    });

    await message.save();

    return res.status(200).json({
      success: true,
      result: { message },
      message: "Successfully send message.",
    });
  },
};

module.exports = chatController;
