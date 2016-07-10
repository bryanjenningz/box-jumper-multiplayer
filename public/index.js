const rootEl = document.querySelector('#root')
const store = Redux.createStore(reducer)
const keys = {
  space: 32
}
const globals = {
  gravity: 0.15,
  jumpVelocity: -3,
  xVelocity: .66,
  pipeSpacingX: 60,
  gameWidthScalar: 3,
  pipeWidth: 25,
}

class View extends React.Component {
  render() {
    var state = store.getState()
    return (
      <div>
        <div>x: {state.players[0].x}</div>
        <div>y: {state.players[0].y}</div>
        <div>vx: {state.players[0].vx}</div>
        <div>vy: {state.players[0].vy}</div>

        <div
          style={{
            position: 'relative',
            width: '300px',
            height: '300px',
            border: '2px solid black'
          }}
        >
          <Player />
          <Pipes />
        </div>
      </div>
    )
  }
}


class Player extends React.Component {
  render() {
    var state = store.getState()
    return (
      <div
        style={{
          position: 'absolute',
          left: state.players[0].x + 'px',
          top: state.players[0].y + 'px',
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
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: globals.gameWidthScalar * pipe.x + 'px',
                top: '0px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '0px',
                  top: '0px',
                  width: '25px',
                  height: '70px',
                  backgroundColor: 'black',
                }}
              ></div>
              <div
                style={{
                  position: 'absolute',
                  left: '0px',
                  top: '140px',
                  width: '25px',
                  height: '160px',
                  backgroundColor: 'black',
                }}
              ></div>
            </div>
          )
        })}
      </div>
    )
  }
}


function reducer(state, action) {
  if (state === undefined) {
    return {
      players: [
        {
          x: 30,
          y: 50,
          vx: 1,
          vy: 0,
          jump: false,
        }
      ],
      pipes: [
        {
          x: 100,
          y: 50,
        }
      ],
      time: 0
    }
  }

  switch (action.type) {
    case 'TICK':
      const players = state.players.map(
        playerState => updatePlayer(playerState, action)
      )
      const pipes = updatePipes(state.pipes, action)
      return Object.assign({}, state, {
        players,
        pipes,
        time: action.time,
      })

    case 'JUMP':
      return Object.assign({}, state, {
        players: [
          Object.assign({}, state.players[0], {
            jump: true
          })
        ]
      })
  }
}


function updatePlayer(state, action) {
  const vy = state.jump ?
    globals.jumpVelocity :
    state.vy + globals.gravity
  const y = vy + state.y

  return Object.assign({}, state, {
    y,
    vy,
    jump: false
  })
}


function updatePipes(state, action) {
  var generatePipe = () => ({x: 100, y: 30 + 40 * Math.random()})
  var isVisible = (pipe) => pipe.x > -globals.pipeWidth
  var updateLocation = (pipe) => Object.assign({}, pipe, {x: pipe.x - globals.xVelocity})
  var addPipeIfNecessary = (pipes) => (pipes.length === 1 && pipes[0].x <= 40) ? pipes.concat(generatePipe()) : pipes
  return addPipeIfNecessary(state.filter(isVisible).map(updateLocation))
}


function init() {
  function startListeners(store) {
    function tick() {
      store.dispatch({
        type: 'TICK',
        time: new Date().getTime()
      })
      requestAnimationFrame(tick)
    }

    function jump() {
      store.dispatch({
        type: 'JUMP'
      })
    }

    tick()
    window.addEventListener('keydown', (e) => {
      if (e.keyCode === keys.space) {
        jump()
      }
    })
  }

  function render() {
    ReactDOM.render(<View />, rootEl)
  }

  startListeners(store)
  store.subscribe(render)
}

init()
