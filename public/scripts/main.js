const form = document.querySelector("form");
const input = document.querySelector(".input");
const messages = document.querySelector(".messages");
const username = prompt("Please enter your Summoner name: ", "") || "Anonymous";
const socket = io();

form.addEventListener("submit", function(event) {
  event.preventDefault();
  addMessage(username + ": " + input.value);

  socket.emit("chat_message", {
    message: input.value
  });

  input.value = "";
    return false;
    }, false);

  socket.on("chat_message", function(data) {
      addMessage(data.username + ": " + data.message);
  });

  socket.on("user_join", function(data) {
      addMessage("Server:" + data + " just joined Ting's rift!");
  });

  socket.on("user_leave", function(data) {
      addMessage("Server:" + data + " has left Ting's rift.");
  });

  socket.on("history", function (history) {
  history.forEach(function (message) {
    addMessage(message.username + ": " + message.message);
  });
});

  addMessage("Server: You have joined Ting's rift as '" + username  + "'.");
  socket.emit("user_join", username);

  function addMessage(message) {
    const li = document.createElement("li"); // Maakt een list item
      
    // Zet username en message in twee verschillende spans
    const user = document.createElement("span");
    const msg = document.createElement("span");
    msg.classList.add("message");
    user.classList.add("username");
    user.innerHTML = getUsernameFromMessage(message);
    msg.innerHTML = ": " + message.substring(message.indexOf(": ") + 1);  
    li.appendChild(user); // Append incoming message to the list item
    li.appendChild(msg); // Append message to the list item
  
    if (username == user.innerHTML) {
      li.classList.add("my-message");
    }else{
      li.classList.add("other-message");
    }
  
    // li.innerHTML = message; // Append the rest of the message after the username
    messages.appendChild(li);
    window.scrollTo(0, document.body.scrollHeight);
  }

function getUsernameFromMessage(message) {
  return message.substring(0, message.indexOf(":"));
}