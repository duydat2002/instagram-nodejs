const { verifyTokenSocket } = require("../middlewares/auth");
const { userRoom, conversationRoom, conversationUsersRoom } = require("../utils");
const handleChatSocket = require("./Chat");
const User = require("../models/user");
const Conversation = require("../models/conversation");

const socketHandle = (io) => {
  io.use(verifyTokenSocket);

  io.use(async (socket, next) => {
    socket.userId = socket.request.user.id;

    const user = await User.findByIdAndUpdate(socket.userId, { isOnline: true });
    const conversations = await Conversation.find({ members: { $elemMatch: { $eq: socket.userId } } });

    conversations?.forEach((conversation) => {
      socket.join(conversationRoom(conversation.id));
      io.to(conversationRoom(conversation.id))
        .except(userRoom(socket.userId))
        .emit("user:connected", { userId: user.id });
    });
    socket.join(userRoom(socket.userId));

    next();
  });

  io.on("connection", async (socket) => {
    handleChatSocket(io, socket);

    socket.on("disconnect", async () => {
      setTimeout(async () => {
        const sockets = await io.in(userRoom(socket.userId)).fetchSockets();
        const hasReconnected = sockets.length > 0;

        if (!hasReconnected) {
          const user = await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastOnline: new Date() });

          const conversations = await Conversation.find({ members: { $elemMatch: { $eq: socket.userId } } });

          conversations?.forEach((conversation) => {
            io.to(conversationRoom(conversation.id))
              .except(userRoom(socket.userId))
              .emit("user:disconnected", { userId: user.id, lastOnline: user.lastOnline });
          });
        }
      }, 10000);
    });
  });
};

module.exports = socketHandle;
