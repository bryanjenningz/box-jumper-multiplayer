const rootEl = document.querySelector('#root')
const store = Redux.createStore(reducer)
const keys = {space: 32}
const globals = {
  gravity: 0.15,
  jumpVelocity: -3,
  xVelocity: .66,
  pipeSpacingX: 60,
  gameWidthScalar: 3,
  pipeWidth: 25,
}
var socket = io()

function sendPlayerState() {
  if (socket && socket.id) {
    socket.emit('update player', store.getState().yourPlayer)
  }
}

socket.on('update player', (player) => {
  store.dispatch({type: 'UPDATE_PLAYER', player})
})

socket.on('disconnected player', (id) => {
  store.dispatch({type: 'DISCONNECT', id})
})

class View extends React.Component {
  render() {
    var state = store.getState()

    return (
      <div>
        <div
          style={{
            position: 'relative',
            width: '300px',
            height: '300px',
            border: '2px solid black'
          }}
        >
          <Player state={state.yourPlayer} />
          {state.players.map((player, i) => {
            return <Player state={player} key={i} />
          })}
          <Pipes />
        </div>
      </div>
    )
  }
}


class Player extends React.Component {
  render() {
    var state = this.props.state
    return (
      <div
        style={{
          position: 'absolute',
          left: state.x + 'px',
          top: state.y + 'px',
          width: '25px',
          height: '25px',
          backgroundColor: 'black'
        }}
      ></div>
    )
  }
}


class Pipes extends React.Component {
  render() {
    var pipes = store.getState().pipes

    return (
      <div style={{position: 'relative'}}>
        {pipes.map((pipe, i) => {
          return <Pipe key={i} pipe={pipe} />
        })}
      </div>
    )
  }
}

class Pipe extends React.Component {
  render() {
    var pipe = this.props.pipe

    // Hacky solution to fix the width so that it never overflows out of the boundary.
    var width
    if (pipe.x < 0) {
      width = globals.pipeWidth + (globals.gameWidthScalar * pipe.x)
    } else if (pipe.x + (globals.pipeWidth / globals.gameWidthScalar) > 100) {
      var rightSide = globals.pipeWidth + (pipe.x * globals.gameWidthScalar)
      var overflowingWidth = rightSide - (globals.gameWidthScalar * 100)
      width = globals.pipeWidth - overflowingWidth
    } else {
      width = globals.pipeWidth
    }

    return (
      <div
        style={{
          position: 'absolute',
          left: globals.gameWidthScalar * Math.max(0, pipe.x) + 'px',
          top: '0px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '0px',
            top: '0px',
            width,
            height: (pipe.y * globals.gameWidthScalar) + 'px',
            backgroundColor: 'black',
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            left: '0px',
            top: (pipe.y * globals.gameWidthScalar + 70) + 'px',
            width,
            height: (globals.gameWidthScalar * 100 - (pipe.y * globals.gameWidthScalar + 70)) + 'px',
            backgroundColor: 'black',
          }}
        ></div>
      </div>
    )
  }
}


function reducer(state, action) {
  if (state === undefined) {
    return {
      yourPlayer: {x: 30, y: 50, vx: 1, vy: 0, jump: false},
      players: [],
      pipes: [{x: 100, y: 50}],
      time: 0
    }
  }

  switch (action.type) {
    // Only update your player on 'TICK' because other players will be updated with 'UPDATE_PLAYER'
    case 'TICK':
      const yourPlayer = updatePlayer(state.yourPlayer, action)
      const pipes = updatePipes(state.pipes, action)
      return Object.assign({}, state, {pipes, yourPlayer, time: action.time})

    case 'JUMP':
      return Object.assign({}, state, {
        yourPlayer: Object.assign({}, state.yourPlayer, {jump: true})
      })

    case 'UPDATE_PLAYER':
      var playerInPlayers = false
      var newState = Object.assign({}, state, {
        players: state.players.map(player => {
          if (action.player.id === player.id) {
            playerInPlayers = true
            return action.player
          }
          return player
        })
      })
      if (!playerInPlayers && action.player.id !== socket.id) {
        newState.players.push(action.player)
      }
      return newState

    case 'DISCONNECT':
      return Object.assign({}, state, {players: state.players.filter(p => p.id !== action.id)})
  }
}

function updatePlayer(state, action) {
  const vy = state.jump ? globals.jumpVelocity : state.vy + globals.gravity
  const y = Math.max(0, Math.min(vy + state.y, 100 * globals.gameWidthScalar - 25))
  return Object.assign({}, state, {y, vy, jump: false})
}

function updatePipes(state, action) {
  var generatePipe = () => ({x: 100, y: 30 + 40 * Math.random()})
  var isVisible = (pipe) => pipe.x > -globals.pipeWidth
  var updateLocation = (pipe) => Object.assign({}, pipe, {x: pipe.x - globals.xVelocity})
  var addPipeIfNecessary = (pipes) => (pipes.length === 1 && pipes[0].x <= 40) ? pipes.concat(generatePipe()) : pipes
  return addPipeIfNecessary(state.filter(isVisible).map(updateLocation))
}

function init() {
  var startListeners = () => {
    var tick = () => {
      store.dispatch({type: 'TICK', time: new Date().getTime()})
      sendPlayerState()
      requestAnimationFrame(tick)
    }
    var jump = () => store.dispatch({type: 'JUMP'})
    var jumpIfSpacePressed = (e) => e.keyCode === keys.space && jump()

    tick()
    addEventListener('keydown', jumpIfSpacePressed)
  }
  var render = () => ReactDOM.render(<View />, rootEl)

  startListeners()
  store.subscribe(render)
}

init()
