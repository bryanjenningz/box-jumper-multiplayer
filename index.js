var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)

app.use(express.static(__dirname + '/public'))

var playerIds = []



io.on('connection', (socket) => {
  function updatePlayerOrder(ids) {
    var idsToOrder = {}
    ids.forEach((id, order) => idsToOrder[id] = order)
    socket.emit('update player order', idsToOrder)
  }

  playerIds.push(socket.id.replace(/[\/#]/g, ''))
  updatePlayerOrder(playerIds)

  socket.on('update player', (player) => {
    player = Object.assign({}, player, {id: socket.id.replace(/[\/#]/g, '')})
    socket.broadcast.emit('update player', player)
  })

  socket.on('disconnect', () => {
    socket.broadcast.emit('disconnected player', socket.id.replace(/[\/#]/g, ''))
    playerIds = playerIds.filter(id => id === socket.id.replace(/[\/#]/g, ''))
    updatePlayerOrder(playerIds)
  })
})

http.listen(9000, () => {})
