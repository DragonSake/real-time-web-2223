# Real-Time Web @cmda-minor-web 2022 - 2023

# League of Legends champion guesser

Voor Real Time Web heb ik een game gemaakt waar je League of Legends champions kunt raden aan de hand van de tags die je ziet op het scherm. Iedereen ziet dezelfde tags. Je kunt met andere mensen chatten of je kunt de champion raden. Degene die als eerste de juiste champion in de chat typt, wint. Wanneer de juiste champion is geraden, verschijnt er een nieuwe champion.

Live demo: https://real-time-web.adaptable.app/

![image](https://github.com/DragonSake/real-time-web-2223/assets/40611000/149033f3-32e9-405c-a4f6-b6aebe2ba247)

***

# Inhoudsopgave

  * [Installatie](#installatie)
    + [Clone repository](#clone-repository)
    + [Install packages](#install-packages)
    + [Server starten](#server-starten)
    + [Localhost](#localhost)
  * [API](#api)
    + [Welke API heb ik hiervoor gebruikt?](#welke-api-heb-ik-hiervoor-gebruikt-)
    + [Fetch](#fetch)
  * [Features](#features)
    + [Join and leave](#join-and-leave)
    + [Messages](#messages)
    + [History](#history)
    + [Check guess](#check-guess)
    + [Guessed right champion](#guessed-right-champion)
    + [New champion](#new-champion)
    + [Easter egg](#easter-egg)
  * [API data model](#api-data-model)
  * [Data flow diagram](#data-flow-diagram)
  * [MoSCoW](#moscow)
  * [Bronnen](#bronnen)
  * [License](#license)

***

## Installatie

### Clone repository

Je kunt dit project installeren op je eigen computer door deze repository te clonen. Je kan gebruik maken van GitHub desktop of de terminal om de volgende commando uit te voeren.

```
git clone https//github.com:DragonSake/real-time-web-2223.git
```

### Install packages

Daarna moeten we de packages installeren

Dit kun je doen door de volgende commando's uit te voeren

```
npm install
```

### Server starten

Hierna kun je de server starten op je lokale dev environment met de volgende code

```
npm run dev
```

### Localhost

Je server zal starten op

```
http://localhost:8888/
```

***

## API

### Welke API heb ik hiervoor gebruikt?

Voor mijn project wilde ik tags van League of Legends champions laten zien en gebruikers kunnen in de chat kunnen dan raden welke champion dat is. League of Legends heeft zelf een heleboel API's en ik heb de volgende API gevonden voor mijn project. In deze API staat informatie over welke champions er zijn en de eigenschappen ervan. Vervolgens heb ik de data ervan gefiltered, want ik heb alleen de champion naam en tags ervan nodig. Daarna heb ik de data gerandomized met Math.random, zodat er telkens een nieuwe champion wordt gegenereerd.

Gebruikte API:

```
http://ddragon.leagueoflegends.com/cdn/13.7.1/data/en_US/champion.json
```

### Fetch

Dit is de code die ik heb geschreven voor het fetchen van de data. Hier haal ik de data op vanuit de link en zet die in een constante genaamd url. Daarna filter ik de data, want ik heb alleen de champion naam en tags ervan nodig. Vervolgens heb ik de data gerandomized met Math.random, zodat er telkens een nieuwe champion wordt gegenereerd.

```JS
async function fetchData() {
    const url = "http://ddragon.leagueoflegends.com/cdn/13.7.1/data/en_US/champion.json";
    const response = await fetch(url);
    const data = await response.json();
    const champions = Object.values(data.data);

    const filteredChampions = champions.filter((champion) => champion).map(({ name, tags }) => ({ name, tags }));

    const tags = filteredChampions.flatMap((champion) => champion.tags);

    randomChampion = filteredChampions[Math.floor(Math.random() * filteredChampions.length)];
    console.log(randomChampion.name);
    console.log(randomChampion.tags);

    tag = "Random tag(s): " + randomChampion.tags.join(", ");

    io.emit("new_champion", tag, randomChampion);
}

fetchData();
```

***

## Features

### Join and leave

Wanneer er nieuwe mensen verbinding maken met de server, word er een bericht verstuurd met: "Server: jouwUsername just joined Ting's rift!" Als mensen besluiten te verlaten, word er een bericht verstuurd met: "Server: jouwUsername has left Ting's rift!"

Client side
```JS
socket.on("user_join", function(data) {
    addMessage("Server:" + data + " just joined Ting's rift!");
});

socket.on("user_leave", function(data) {
      addMessage("Server:" + data + " has left Ting's rift.");
  });
```

Server side

Wanneer er nieuwe mensen verbinding maken met de server, zal de server de usernames van die mensen opslaan en een bericht met de tag "user_join" uitzenden naar alle clients. Als mensen besluiten te verlaten, zal de server een bericht uitzenden naar andere clients als doel om andere gebruikers te laten weten dat er iemand is vertrokken. 

```JS
socket.on("user_join", function (data) {
    this.username = data;
    socket.broadcast.emit("user_join", data);

    // Send chat history to the new connected user
    socket.emit("history", history);
  });
  
  socket.on("disconnect", function (data) {
    socket.broadcast.emit("user_leave", this.username);
  });
});
 ```
 
 ***

### Messages

Wanneer een gebruiker een bericht verstuurt, wordt dit bericht naar zowel de andere clients als de server verzonden. Daarna wordt het invulveld leeggemaakt, zodat de gebruiker weer een bericht kan typen. Daarnaast maak ik spannen met classes waardoor berichten van anderen geel worden en die van jezelf blauw.

```JS
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
  
function addMessage(message) {
    const li = document.createElement("li");
      
    const user = document.createElement("span");
    const msg = document.createElement("span");

    msg.classList.add("message");
    user.classList.add("username");

    user.innerHTML = getUsernameFromMessage(message);
    msg.innerHTML = ": " + message.substring(message.indexOf(": ") + 1);  

    li.appendChild(user);
    li.appendChild(msg);
  
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
```

***

### History

De geschiedenis wordt bijgehouden, zodat nieuw geconnecte gebruikers de chatgeschiedenis nog kunnen lezen en weten welke guesses er al waren gedaan. Hiermee kunnen ze weten wat het antwoord niet was en verdergaan met raden. De history wordt gepusht naar de history array. Als er meer dan 49 berichten in de geschiedenis staan, moeten we de oudste berichten verwijderen om ruimte te maken voor nieuwe berichten.

```JS
const historySize = 50;
let history = [];

socket.on("user_join", function (data) {
    this.username = data;
    socket.broadcast.emit("user_join", data);

    socket.emit("history", history);
  });
  
socket.on("chat_message", function (data) {
    data.username = this.username;
    socket.broadcast.emit("chat_message", data);

    history.push(data);

    if (history.length > historySize) {
      history.shift();
    }
  });
```

***

### Check guess

Zet de berichten om in lowercase en checkt de berichten of ze gelijk zijn met de champion naam. Het verstuurt guessed_right_champion naar alle andere clients. Vervolgens doet het een nieuwe fetch om een nieuwe champion te genereren.

```JS
if (data.message.toLowerCase() === randomChampion.name.toLowerCase()) {
      socket.emit("guessed_right_champion");
      socket.broadcast.emit("guessed_right_champion");
      fetchData();
    } 
```

### Guessed right champion

Wanneer de juiste champion is geraden, krijgt elke gebruiker een bericht te zien dat de juiste champion is geraden.

```JS
socket.on("guessed_right_champion", function () {
  addMessage("Server: The right champion has been guessed!");
});
```

***

### New champion

Wanneer de juiste champion is geraden, krijgt elke gebruiker een bericht te zien dat er een nieuwe champion is geselecteerd en de tags worden geupdate.

```JS
socket.on("new_champion", function (tags, randomChampion) {
  addMessage("Server: A new champion has been selected!");
  document.querySelector("h2").innerHTML = `${tags}`;
  console.log(randomChampion.name);
});
```

***

### Easter egg

Voor noobs of mensen die het echt niet kunnen raden heb ik een Easter egg in toegevoegd. In de console kan je namelijk zien wat het antwoord is.

```JS
console.log(randomChampion.name);
```

***

## API data model

![Datamodel](https://github.com/DragonSake/real-time-web-2223/assets/40611000/543a637e-033c-4598-ba93-a3e851fd302e)

***

## Data flow diagram

![Data flow diagram](https://github.com/DragonSake/real-time-web-2223/assets/40611000/e6b20cfc-8ed8-4e73-b854-c3f95158dde0)

***

## MoSCoW

M - Must have
Een must voor het eindproduct

- [X] Berichten versturen
- [X] Berichten ontvangen
- [X] Usernames
- [X] API connecten en gebruiken
- [X] History
- [X] Werkt op Adaptable
- [X] Wanneer de juiste champion is geraden, dat je iets in de chat ziet
- [X] Wanneer de juiste champion is geraden, dat je verder gaat naar de volgende champion

S - Should have
Deze features kunnen erbij, maar ze zijn niet noodzakelijk om het te gebruiken

- [X] Niet hoofdlettergevoelig
- [ ] Usernames opslaan in database, zodat als iemand vertrekt er geen null komt te staan (null has left the room)
- [ ] De champions die geweest zijn, komen in een andere array en die kunnen vervolgens niet nog een keer voorkomen tenzij de hele array van komende champions leeg is
- [ ] Iconen voor de tags
- [ ] Offline support

C - Could have
Deze features kunnen toegevoeds worden als er genoeg tijd voor is

- [ ] Dialog in plaats van prompt
- [ ] Punt voor elk geraden champion
- [ ] Winnaar

W - Would have
Dit kan in de toekomst toegevoegd worden

- [ ] Light en dark mode

***

## Bronnen

* https://github.com/ju5tu5/barebonechat/blob/main/server.js
* https://github.com/ju5tu5/barebonechat/blob/main/public/script.js
* http://ddragon.leagueoflegends.com/cdn/13.7.1/data/en_US/champion.json
* https://sabe.io/tutorials/how-to-build-real-time-chat-app-node-express-socket-io
* https://technology.riotgames.com/news/chat-service-architecture-protocol
* https://stackoverflow.com/questions/32195310/pass-data-through-to-the-view-in-express

***

## License

MIT License
