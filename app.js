var canvas = null;
var ctx = null;
var player = null;
var dir = 0;
var lastPress = null;
var pause = true;

var score = 0;

var keyEnter = 13;
var keyLeft= 37,
    keyUp = 38,
    keyRight = 39,
    keyDown = 40;

var wall = new Array ();

//compatibility problems of RequestAnimationFrame
window.requestAnimationFrame = (function () {
  return window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback,17);
    };
}());

//listener for directions
document.addEventListener('keydown', function (evt) {
  lastPress = evt.which;
}, false);

function random(max) {
  return Math.floor(Math.random() * max);
  }

//Rectangle
function Rectangle(x, y, width, height) {
  this.x = (x == null) ? 0 : x;
  this.y = (y == null) ? 0 : y;
  this.width = (width == null) ? 0 : width;
  this.height = (height == null) ? this.width : height;
  this.intersects = function (rect) {
    if (rect == null) {
      window.console.warn('Missing parameters on function intersects');
      } else {
      return (this.x < rect.x + rect.width &&
      this.x + this.width > rect.x &&
      this.y < rect.y + rect.height &&
      this.y + this.height > rect.y);
    }
  };
  this.fill = function (ctx) {
    if (ctx == null) {
      window.console.warn('Missing parameters on function fill');
      } else {
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  };
}
//Paint
function paint (ctx) {
  //Canvas
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  //Player 
  ctx.fillStyle = '#c89483';
  player.fill(ctx);
  //Food
  ctx.fillStyle = '#c8cfd6';
  food.fill(ctx);
  //Draw walls
  ctx.fillStyle = '#999';
  for (i=0, l = wall.length; i < l ; i++) {
    wall[i].fill(ctx);
  }
  // Draw score
  ctx.fillStyle = '#d37c66';
  ctx.fillText('Score: ' + score, 0, 10);
  //Last Key pressed
  //ctx.fillStyle = '#fff';
  //ctx.fillText('Last Press: ' + lastPress, 0, 20);

  //Draw pause
  if (pause) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#d37c66';
    ctx.fillText('PAUSE', 150, 75);
    ctx.textAlign = 'left';
    }
}

function act() {
  if (!pause) {
    //Change Direction
    if (lastPress == keyUp) {
      dir = 0;
    }
    if (lastPress == keyRight) {
      dir = 1;
    }
    if (lastPress == keyDown) {
      dir = 2;
    }
    if (lastPress == keyLeft) {
      dir = 3;
    }

    //Move Rect
    if (dir == 0) {
      player.y -= 5;
    }
    if (dir == 1) {
      player.x += 5;
    }
    if (dir == 2) {
      player.y += 5;
    }
    if (dir == 3) {
      player.x -= 5;
    }

    //Out Screen
    if (player.x > canvas.width) {
      player.x = 0;
    }
    if (player.y > canvas.height) {
      player.y = 0;
    }
    if (player.x < 0) {
      player.x = canvas.width;
    }
    if (player.y < 0) {
      player.y = canvas.height;
    }
    // Food Intersects
    if (player.intersects(food)) {
      score += 1;
      food.x = random(canvas.width / 10 - 1) * 10;
      food.y = random(canvas.height / 10 - 1) * 10;
      }
    //Wall Intersects
    for (i = 0, l = wall.length; i < l; i++) {
      if(food.intersects(wall[i])) {
        food.x = random(canvas.width / 10-1) * 10;
        food.y = random(canvas.height / 10-1) * 10;
      }
      if(player.intersects(wall[i])) {
        pause = true;
      }
    }
  }

// Pause/Unpause
if (lastPress == keyEnter) {
  pause = !pause;
  lastPress = null;
  }
}

//Refresh
function repaint () {
  window.requestAnimationFrame(repaint);
  paint(ctx);
}

function run () {
  setTimeout(run, 50);
  act();
}

//Canvas init
function init() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  //Player
  player = new Rectangle(40, 40, 10, 10);
  //Food
  food = new Rectangle(80, 80, 10, 10)
  //Walls
  wall.push(new Rectangle (100, 50, 10, 10));
  wall.push(new Rectangle (100, 100, 10, 10));
  wall.push(new Rectangle (100, 150, 10, 10));
  wall.push(new Rectangle (200, 50, 10, 10));
  wall.push(new Rectangle (200, 100, 10, 10));
  wall.push(new Rectangle (200, 150, 10, 10));
  run();
  repaint();
}

window.addEventListener('load', init, false);