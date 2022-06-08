const users = [];

const addUser = ({ id, username, room }) => {
  const userName = username?.trim().toLowerCase();
  const roomName = room?.trim().toLowerCase();

  if (!userName || !roomName) {
    return {
      error: "Username and Room required",
    };
  }

  if (
    users.find((user) => user.room === roomName && user.username === userName)
  ) {
    return {
      error: "A user with this name already exists",
    };
  }

  const addedUser = { id, username: userName, room: roomName };

  users.push(addedUser);

  return {
    user: addedUser,
  };
};

const removeUser = (id) => {
  const indexToBeDeleted = users.findIndex((user) => user.id === id);
  const userToBeDeleted = users.find((user) => user.id === id);
  users.splice(indexToBeDeleted, 1);
  return userToBeDeleted;
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room.toLowerCase());
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
