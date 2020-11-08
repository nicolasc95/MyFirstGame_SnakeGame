var canvas = null;
var ctx = null;

function paint (ctx) {
  ctx.fillStyle = '#0f0';
  ctx.fillRect(100, 50, 100, 100);
}

function init() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  paint (ctx);
}

window.addEventListener('load', init, false);


