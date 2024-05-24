// Broadcast to other tabs of the same user
const userRoom = (userId) => {
  return `user-${userId}`;
};

const conversationRoom = (conversationId) => {
  return `conversation-${conversationId}`;
};

const socketUtil = {
  userRoom,
  conversationRoom,
};

module.exports = socketUtil;
