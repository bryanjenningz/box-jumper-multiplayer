var SPACEBAR = 32, jumped = false, name = '?', gameover = true;

function createCanvas(width = 200, height = 200) {
  var canvas = document.createElement('canvas');
  canvas.setAttribute('width', width);
  canvas.setAttribute('height', height);
  canvas.setAttribute('style', 'background-color: white; border: 1px solid black;');
  document.body.appendChild(canvas);
  return canvas.getContext('2d');
}

function createNameBox() {
  var input = document.createElement('input');
  input.setAttribute('placeholder', 'Change your name');
  input.setAttribute('style', 'display: block');
  input.addEventListener('keyup', function changeName(e) {
    if (/\w+/.test(input.value)) {
      name = input.value.split('').filter(ch => /\w/.test(ch)).join('');
    }
    if (e.keyCode === SPACEBAR) {
      input.blur();
    }
  });
  document.body.appendChild(input);
  return input;
}

function drawBox(context, x, y, rotation = 0) {
  var width = 20, height = 20;
  var centerX = x + width/2, centerY = y + height/2;
  context.translate(centerX, centerY);
  context.rotate(rotation);
  context.fillRect(-width/2, -height/2, width, height);
  context.rotate(-rotation);
  context.translate(-centerX, -centerY);
}

function createBox() {
  return {x: 40, y: 40, vx: 0, vy: 0};
}

function update(state) {
  state.box = updateVelocity(state.box);
  state.pipes = updatePipes(state.pipes);
  state.context.clearRect(0, 0, 200, 200);
  if (!state.pipes[0].passed && state.pipes[0].x < state.box.x) {
    state.score += 1;
    state.pipes[0].passed = true;
  }
  state.pipes.forEach((pipe) => drawPipe(state.context, pipe.x, pipe.openIndex));
  drawBox(state.context, state.box.x, state.box.y);
  labelBox(state.context, state.box)
  state.context.fillText(state.score, 12, 12);
  if (isCollision(state)) {
    gameover = true;
    return;
  }
  requestAnimationFrame(function() { update(state); });
}

function updateVelocity(box) {
  var gravity = -0.15;
  var y = box.y - box.vy, vy = jumped ? 3 : box.vy + gravity;
  jumped = false;
  return Object.assign({}, box, {y, vy});
}

function updatePipes(pipes) {
  if (pipes.slice(-1)[0].x <= 50) {
    pipes = pipes.concat(generatePipe());
  }
  return pipes.filter((pipe) => pipe.x > -20)
    .map((pipe) => Object.assign({}, pipe, {x: pipe.x - 2}));
}

function drawPipe(context, x, openIndex) {
  context.fillRect(x, 0, 20, openIndex * 20);
  context.fillRect(x, (openIndex + 3) * 20, 20, 200 - (openIndex + 1));
}

function generatePipe() {
  var openIndex = Math.floor(Math.random() * 6) + 1;
  return {x: 190, openIndex};
}

function isCollision(state) {
  var boxLeft = state.box.x, boxRight = state.box.x + 20,
    boxTop = state.box.y, boxBottom = state.box.y + 20;
  return state.pipes.some((pipe) => {
    var pipeLeft = pipe.x, pipeRight = pipe.x + 20,
      openingTop = pipe.openIndex * 20, openingBottom = (pipe.openIndex + 3) * 20;
    return pipeLeft <= boxRight && pipeRight >= boxLeft &&
      (openingTop > boxTop || openingBottom < boxBottom);
  });
}

function labelBox(context, box) {
  context.fillStyle = 'white';
  context.fillText(name[0].toUpperCase(), box.x + 7, box.y + 13);
  context.fillStyle = 'black';
}

function init() {
  var context = createCanvas();
  context.fillText('Enter your name in the input box below', 7, 75);
  context.fillText('Press SPACEBAR to start and to jump', 7, 95);
  var input = createNameBox();
  addEventListener('keydown', function jump(e) {
    if (e.keyCode === SPACEBAR) {
      if (gameover) {
        gameover = false;
        update({box: createBox(), context: context, pipes: [generatePipe()], score: 0});
        input.value = input.value.trim(); // if the user was focused on the input box and pressed space to start the game
      } else {
        jumped = true;
      }
    }
  });
}

init();
