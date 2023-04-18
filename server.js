import express from "express";
import httpModule from 'http';
import { Server } from "socket.io";

const app = express();
const http = httpModule.createServer(app);
const io = new Server(http);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.render('index.ejs')
})

// public folder
app.use(express.static('public'))

// use ejs
app.set('view engine', 'ejs')

io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('message', (message) => {
    io.emit('message', message)
  })

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

http.listen(port, () => {
  console.log('listening on port ', port)
})