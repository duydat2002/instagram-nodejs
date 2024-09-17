const User = require("@/models/user");
const Message = require("@/models/message");
const Conversation = require("@/models/conversation");
const UserConversation = require("@/models/userConversation");
const { isValid } = require("date-fns");
const { Types } = require("mongoose");
const { conversationRoom, userRoom } = require("@/utils");

const chatController = {
  getConvesations: async (req, res) => {
    const conversations = await Conversation.find({ members: { $elemMatch: { $eq: req.payload.id } } }).sort({
      updatedAt: -1,
    });

    const conversationsWithMeta = await Promise.all(
      conversations.map(async (c) => {
        const userConv = await UserConversation.findOne({ user: req.payload.id, conversation: c._id });

        return {
          ...c.toObject(),
          unreadCount: userConv ? userConv.unreadCount : 0,
        };
      })
    );

    return res.status(200).json({
      success: true,
      result: { conversations: conversationsWithMeta },
      message: "Successfully get user conversations.",
    });
  },
  getConversation: async (req, res) => {
    const userId = req.payload.id;
    const { members } = req.body;

    const conversation = await Conversation.findOne({ members: { $all: members } });
    if (conversation)
      return res.status(400).json({
        success: false,
        result: null,
        message: "This conversation already exists.",
      });

    return res.status(200).json({
      success: true,
      result: { conversation },
      message: "Successfully get conversation.",
    });
  },
  createConversation: async (req, res) => {
    const userId = req.payload.id;
    const { type, members, groupName } = req.body;

    if (type == "duo" || members?.length == 2) {
      let conversation = await Conversation.findOne({ type, members: { $all: members } });
      if (conversation)
        return res.status(200).json({
          success: true,
          result: { conversation },
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
    await Promise.all(
      members.map(async (m) => {
        await new UserConversation({ user: m, conversation: conversation._id }).save();
        global.io.to(userRoom(m)).emit("conversation:created", conversation);
        global.io.in(userRoom(m)).socketsJoin(conversationRoom(conversation._id));
      })
    );

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

    await Promise.all(
      people.map(async (m) => {
        const userConv = await UserConversation.findOne({ user: m, conversation: conversation._id });

        if (!userConv) await new UserConversation({ user: m, conversation: conversation._id }).save();
      })
    );

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

    await Promise.all(
      people.map(async (m) => {
        await UserConversation.deleteOne({ user: m, conversation: conversation._id });
      })
    );

    return res.status(200).json({
      success: true,
      result: { conversation },
      message: "Successfully delete people to conversation.",
    });
  },
  getMessagesInChat: async (req, res) => {
    const conversationId = req.params.conversationId;
    let { oldestMessageId, limit } = req.query;
    limit = isNaN(parseInt(limit)) ? 30 : parseInt(limit);

    let query = { conversation: conversationId };

    if (oldestMessageId) {
      query._id = { $lt: new Types.ObjectId(oldestMessageId) };
    }

    const messages = await Message.find(query).sort({ _id: -1 }).limit(limit);

    return res.status(200).json({
      success: true,
      result: { messages },
      message: "Successfully get messages in conversation.",
    });
  },
  sendMessage: async (req, res) => {
    const conversationId = req.params.conversationId;
    const { type, content, replyTo } = req.body;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Cannot found conversation.",
      });

    const message = new Message({
      conversation: conversationId,
      author: req.payload.id,
      type,
      content,
      replyTo,
    });

    await message.save();

    conversation.lastMessage = message.id;
    await conversation.save();

    global.io.to(conversationRoom(conversation.id)).emit("message:sent", message);

    return res.status(200).json({
      success: true,
      result: { message },
      message: "Successfully send message.",
    });
  },
};

module.exports = chatController;
