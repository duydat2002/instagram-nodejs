const { userRoom, conversationRoom } = require("@/utils");

const createConversation = ({ io, socket }) => {
  return async (payload, callback) => {
    if (typeof callback !== "function") {
      return;
    }

    const conversation = payload;

    io.in(userRoom(socket.userId)).socketsJoin(conversationRoom(conversation.id));
    conversation.members?.forEach((member) => {
      io.in(userRoom(member)).socketsJoin(conversationRoom(conversation.id));
    });

    io.in(conversationRoom(conversation.id)).emit("conversation:created", { conversation });

    // return callback({
    //   success: true,
    //   data: { members },
    //   message: "Conversation joinned.",
    // });
  };
};

const handleChatSocket = (io, socket) => {
  socket.on("conversation:create", createConversation({ io, socket }));
};

module.exports = handleChatSocket;
