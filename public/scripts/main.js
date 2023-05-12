const form = document.querySelector("form");
const input = document.querySelector(".input");
const messages = document.querySelector(".messages");
const username = prompt("Please enter your Summoner name: ", "") || "Anonymous";
const socket = io();

// When a user sends a message, broadcast it to the clients
form.addEventListener("submit", function(event) {
  event.preventDefault();
  addMessage(username + ": " + input.value);

  // Send messages to server
  socket.emit("chat_message", {
    message: input.value
  });

  // Clear input field
  input.value = "";
    return false;
    }, false);

  // When a user joins, set username and broadcast it to the clients
  socket.on("user_join", function(data) {
    addMessage("Server:" + data + " just joined Ting's rift!");
});

  // When a user writes messages it broadcast to the clients
  socket.on("chat_message", function(data) {
      addMessage(data.username + ": " + data.message);
  });

  // When a user leaves, broadcast it to the clients
  socket.on("user_leave", function(data) {
      addMessage("Server:" + data + " has left Ting's rift.");
  });

  // When a user joins, bring chat history
  socket.on("history", function (history) {
  history.forEach(function (message) {
    addMessage(message.username + ": " + message.message);
  });
});

  // Send username to server
  socket.emit("user_join", username);

  // Adds a message to the user
  addMessage("Server: You have joined Ting's rift as '" + username  + "'.");

  // Adds messages to the chat with a username
  function addMessage(message) {
    // Creates a list item
    const li = document.createElement("li");
      
    // Set span elements
    const user = document.createElement("span");
    const msg = document.createElement("span");

    // Add classes to the span elements
    msg.classList.add("message");
    user.classList.add("username");

    // Set innerHTML
    user.innerHTML = getUsernameFromMessage(message);
    msg.innerHTML = ": " + message.substring(message.indexOf(": ") + 1);  

    // Append span elements to the list item
    li.appendChild(user);
    li.appendChild(msg);
  
    // If the username is the same as the user, add class my-message, else add class other-message
    if (username == user.innerHTML) {
      li.classList.add("my-message");
    }else{
      li.classList.add("other-message");
    }
  
    // Append list item to the messages
    messages.appendChild(li);

    // Scroll to bottom of messages
    window.scrollTo(0, document.body.scrollHeight);
  }

// Returns the username from a message
function getUsernameFromMessage(message) {
  return message.substring(0, message.indexOf(":"));
}