var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)

app.use(express.static(__dirname + '/public'))

io.on('connection', (socket) => {
  console.log(socket.id + ' connected')
  socket.on('update player', (player) => {
    player = Object.assign({}, player, {id: socket.id.replace(/[\/#]/g, '')})
    socket.broadcast.emit('update player', player)
  })

  socket.on('disconnect', () => {
    socket.broadcast.emit('disconnected player', socket.id.replace(/[\/#]/g, ''))
    console.log(socket.id + ' disconnected')
  })
})

http.listen(3000, () => console.log('Listening on port 3000.'))
