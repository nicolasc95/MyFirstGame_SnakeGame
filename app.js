var canvas = null;
var ctx = null;
var x = 50,
    y = 50;
var dir = 0;
var lastPress = null;
var pause = true;

var keyEnter = 13;
var keyLeft= 37,
    keyUp = 38,
    keyRight = 39,
    keyDown = 40;

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

//Base
function paint (ctx) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#c89483';
  ctx.fillRect(x, y, 10, 10);

  ctx.fillStyle = '#fff';
  ctx.fillText('Last Press: ' + lastPress, 0, 20);

//Draw pause
if (pause) {
  ctx.textAlign = 'center';
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
      y -= 5;
    }
    if (dir == 1) {
      x += 5;
    }
    if (dir == 2) {
      y += 5;
    }
    if (dir == 3) {
      x -= 5;
    }

    //Out Screen
    if (x > canvas.width) {
      x = 0;
    }
    if (y > canvas.height) {
      y = 0;
    }
    if (x < 0) {
      x = canvas.width;
    }
    if (y < 0) {
      y = canvas.height;
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
  run();
  repaint();
}

window.addEventListener('load', init, false);