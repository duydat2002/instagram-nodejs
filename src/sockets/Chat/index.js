const UserConversation = require("@/models/userConversation");
const Conversation = require("@/models/conversation");
const Message = require("@/models/message");
const { userRoom, conversationRoom } = require("@/utils");

const createConversation = ({ io, socket }) => {
  return async (payload, callback) => {
    if (typeof callback !== "function") {
      return;
    }

    console.log("conversation:created");

    const conversation = payload;

    io.in(userRoom(socket.userId)).socketsJoin(conversationRoom(conversation.id));
    conversation.members?.forEach((member) => {
      io.in(userRoom(member)).socketsJoin(conversationRoom(conversation.id));
    });

    io.in(conversationRoom(conversation.id)).emit("conversation:created", {
      conversation,
    });

    // return callback({
    //   success: true,
    //   data: { members },
    //   message: "Conversation joinned.",
    // });
  };
};

const handleChatSocket = async (io, socket) => {
  socket.on("conversation:created", ({ conversationId }) => {
    console.log("conversation:created");
    // io.in(userRoom(socket.userId)).socketsJoin(conversationRoom(conversation.id));
  });
  socket.on("conversation:read", async ({ conversationId }) => {
    await UserConversation.updateOne({ user: socket.userId, conversation: conversationId }, { unreadCount: 0 });
    socket.to(userRoom(socket.userId)).emit("conversation:read", { conversationId });
  });
  socket.on("conversation:incUnread", async ({ conversationId }) => {
    await UserConversation.updateOne(
      { user: socket.userId, conversation: conversationId },
      { $inc: { unreadCount: 1 } }
    );
  });
  socket.on("messages:read", async ({ conversationId, messageIds }) => {
    const nowDate = new Date();

    await Promise.all([
      Message.updateMany(
        { _id: { $in: messageIds }, author: { $ne: socket.userId }, "readBy.userId": socket.userId },
        {
          $set: { "readBy.$.readAt": nowDate },
        }
      ),
      Message.updateMany(
        { _id: { $in: messageIds }, author: { $ne: socket.userId }, "readBy.userId": { $ne: socket.userId } },
        { $addToSet: { readBy: { userId: socket.userId, readAt: nowDate } } }
      ),
    ]);

    socket
      .to(conversationRoom(conversationId))
      .emit("messages:read", { conversationId, messageIds, userId: socket.userId, readAt: nowDate });
  });
  socket.on("message:typing", async ({ conversationId, isTyping }) => {
    const conversation = await Conversation.find({
      _id: conversationId,
      members: socket.userId,
    });

    if (conversation) {
      socket.to(conversationRoom(conversationId)).emit("message:typing", {
        userId: socket.userId,
        conversationId,
        isTyping,
      });
    }
  });
};

module.exports = handleChatSocket;
