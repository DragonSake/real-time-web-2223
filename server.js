// Import modules
import { Server } from 'socket.io';
import express from 'express';
import httpModule from 'http';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const http = httpModule.createServer(app);
const io = new Server(http);
const port = process.env.PORT || 3000;

// Public folder
app.use(express.static('public'))

// View engine
app.set('view engine', 'ejs');

// Render index.ejs
app.get("/", function(req, res) {
    res.render('index', {taggies: tag, championName: randomChampion.name}); // render 'index' with the tag variable
});

// Declare randomChampion and tag
let randomChampion;
let tag = "";

// Fetch data from API
async function fetchData() {
    const url = "http://ddragon.leagueoflegends.com/cdn/13.7.1/data/en_US/champion.json";
    const response = await fetch(url);
    const data = await response.json();
    const champions = Object.values(data.data);

    // Returns an array of champions and their tags
    const filteredChampions = champions.filter((champion) => {
        return champion
    }).map(({ name, tags }) => ({ name, tags }));

    // Returns an array of tags
    const tags = filteredChampions.flatMap((champion) => {
        return champion.tags;
    });

    // Returns a random tag from the tags array
    randomChampion = filteredChampions[Math.floor(Math.random() * filteredChampions.length)];
    console.log(randomChampion.name)
    console.log(randomChampion.tags)

    // Set tag to Random tag(s): + randomChampion.tags
    tag = "Random tag(s): " + randomChampion.tags.join(", ");


    // Emit new champion data to all connected clients
    io.emit("new_champion", tag, randomChampion);
}

// Call fetchData() function initially
fetchData();

// Chat history amount of messages and an empty array
const historySize = 50;
let history = [];

// When a user connects, fetch data and emit it to the client
io.on("connection", function (socket) {
  socket.on("fetchChampionData", () => {
    fetchData();
  });

  // When a user joins, set username and broadcast it to the client
  socket.on("user_join", function (data) {
    this.username = data;
    socket.broadcast.emit("user_join", data);

    // Send chat history to the new connected user
    socket.emit("history", history);
    // Send random champion name to the new connected user
    socket.emit("random_champion", randomChampion.name);
  });

  // When a user sends a message, broadcast it to the clients
  socket.on("chat_message", function (data) {
    data.username = this.username;
    socket.broadcast.emit("chat_message", data);

    // Add new message to history array
    history.push(data);

    // Remove oldest message if history array has more than 49 messages
    if (history.length > historySize) {
      history.shift();
    }

    // if message is equal to randomChampion.name, alert to every client that the champion has been guessed by username
    if (data.message.toLowerCase() === randomChampion.name.toLowerCase()) {
      socket.emit("guessed_right_champion");
      socket.broadcast.emit("guessed_right_champion");
      fetchData();
    }    
  });

  // When a user disconnects, broadcast it to the clients
  socket.on("disconnect", function (data) {
    socket.broadcast.emit("user_leave", this.username);
  });
});

// Listen on port 3000
http.listen(port, function() {
    console.log("Listening on 127.0.0.1:" + port);
});