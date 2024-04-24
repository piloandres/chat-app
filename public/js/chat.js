const socketio = io();

const $messageForm = document.querySelector("#chatForm");
const $messageFormInput = document.querySelector("#messageInput");
const $messageFormButton = document.querySelector("button");
const $sendLocationButton = document.querySelector("#sendLocationButton");
const $messages = document.querySelector("#messages");

const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  const $newMessage = $messages.lastElementChild;

  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  const visibleHeight = $messages.offsetHeight;

  const containerHeight = $messages.scrollHeight;

  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socketio.on("message", ({ text, createdAt, username }) => {
  const html = Mustache.render(messageTemplate, {
    message: text,
    createdAt: moment(createdAt).format("h:mm a"),
    username,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socketio.on("locationMessage", ({ text, createdAt, username }) => {
  const html = Mustache.render(locationTemplate, {
    locationURL: text,
    createdAt: moment(createdAt).format("h:mm a"),
    username,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socketio.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

const chatForm = document.querySelector("#chatForm");

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled");
  const inputMessage = event.target.elements.messageInput;
  socketio.emit("sendMessage", inputMessage.value, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) return console.log(error);
    return console.log("Message delivered");
  });
  inputMessage.value = "";
});

const sendLocationButton = document.querySelector("#sendLocationButton");

sendLocationButton.addEventListener("click", () => {
  const isNotGeolocationSupported = !navigator.geolocation;
  if (isNotGeolocationSupported) {
    return alert("Geolocation is not supported in this browser.");
  }
  $sendLocationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    socketio.emit("sendLocation", { lat: latitude, long: longitude }, () => {
      $sendLocationButton.removeAttribute("disabled");
      console.log("Location shared!");
    });
  });
});

socketio.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
