// store/users.js
const users = new Map();

const userStore = {
  addUser(id, userData) {
    const user = {
      id,
      name: userData.name,
      email: userData.email,
      socketId: null,
      isOnline: false,
      ...userData
    };
    users.set(id, user);
    return user;
  },

  updateUserSocket(id, socketId) {
    const user = users.get(id);
    if (user) {
      user.socketId = socketId;
      user.isOnline = true;
      users.set(id, user);
    }
    return user;
  },

  updateUserStatus(id, isOnline) {
    const user = users.get(id);
    if (user) {
      user.isOnline = isOnline;
      users.set(id, user);
    }
    return user;
  },

  getUser(id) {
    return users.get(id);
  },

  getAllUsers() {
    return Array.from(users.values());
  },

  getOnlineUsers() {
    return Array.from(users.values()).filter(user => user.isOnline);
  },

  removeUser(id) {
    return users.delete(id);
  }
};

module.exports = userStore;