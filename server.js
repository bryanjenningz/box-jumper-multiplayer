var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)

app.use(express.static(__dirname + '/public'))

io.on('connection', (socket) => {
  socket.on('update player', (player) => {
    player = Object.assign({}, player, {id: socket.id.replace(/[\/#]/g, '')})
    socket.broadcast.emit('update player', player)
  })
})

http.listen(3000, () => console.log('Listening on port 3000.'))
