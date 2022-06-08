const express = require("express");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const filterBadWords = require("bad-words");
const { generateMessage, generateLocationURL } = require("./utils/message");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New WebSocket connection!");

  socket.on("formSubmitted", (message, callback) => {
    const filter = new filterBadWords(); // filter bad words

    const user = getUser(socket.id);

    if (filter.isProfane(message)) return callback("!!! Bad Language detected");
    io.to(user.room).emit(
      "messageReceived",
      generateMessage(user.username, message)
    );
    callback("------- Message Delivered -----------");
  });

  socket.on("join", ({ username, room }, callback) => {
    const { user, error } = addUser({ id: socket.id, username, room });
    if (error) return callback(error);

    socket.join(room.toLowerCase()); // join chatroom
    socket.emit(
      "messageReceived",
      generateMessage("Chatroom", `Welcome to the ${room} chatroom!`)
    );
    socket
      .to(user.room)
      .emit(
        "messageReceived",
        generateMessage(
          "Chatroom",
          `${user.username.toUpperCase()} has joined!`
        )
      );

    io.to(user.room).emit("roomUpdate", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    console.log("object", user);
    if (user) {
      io.to(user.room).emit(
        "messageReceived",
        generateMessage("Chatroom", `${user.username.toUpperCase()} has left`)
      );
      io.to(user.room).emit("roomUpdate", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });

  socket.on("sendLocation", (coordinates, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationReceived",
      generateLocationURL(
        user.username,
        `https://google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`
      )
    );
    callback("Location SHared------------->");
  });
});

server.listen(port, () => {
  console.log("Listening on Port", port);
});
