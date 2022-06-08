const socket = io();

// dom elements
const $messageForm = document.getElementById("messageForm");
const $shareLocationButton = document.getElementById("sendLocation");
const $messageDiv = document.getElementById("messages");
const $sidebarDiv = document.getElementById("sidebar");
const $messageFormButton = $messageForm.querySelector("button");
const $messageFormInput = $messageForm.querySelector("input");

// Templates
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;
const sideBarTemplate = document.getElementById("sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

document.getElementById("messageForm").addEventListener("submit", (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled");
  socket.emit(
    "formSubmitted",
    e.target.elements.message.value,
    (acknowledgement) => {
      console.log(acknowledgement);
      $messageFormButton.removeAttribute("disabled");
      $messageFormInput.value = "";
      $messageFormInput.focus();
    }
  );
});

// auto-scroll
const autoScroll = () => {
  // new message element
  const $newMessage = $messageDiv.lastElementChild;
  // height of the new meesage
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messageDiv.offsetHeight;

  // Height of message container
  const containerHeight = $messageDiv.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messageDiv.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messageDiv.scrollTop = $messageDiv.scrollHeight;
  }
};

// message event
socket.on("messageReceived", (message) => {
  console.log("User -----> ", message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messageDiv.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

// location event
socket.on("locationReceived", (location) => {
  console.log("User -----> ", location);
  const html = Mustache.render(locationTemplate, {
    username: location.username,
    location: location.url,
    createdAt: moment(location.createdAt).format("h:mm a"),
  });
  $messageDiv.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

// User list in room
socket.on("roomUpdate", (roomData) => {
  const html = Mustache.render(sideBarTemplate, {
    roomName: roomData.room.toUpperCase(),
    usersList: roomData.users,
  });
  $sidebarDiv.insertAdjacentHTML("beforeend", html);
});

$shareLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Location Services are not supported by your browser!");
  }

  $shareLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      (acknowledgement) => {
        console.log(acknowledgement);
        $shareLocationButton.removeAttribute("disabled");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
