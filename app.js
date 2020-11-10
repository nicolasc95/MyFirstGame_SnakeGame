/*jslint bitwise:true, es5: true */
(function (window, undefined){
  'use strict';
  //General Variables
  var canvas = null;
  var ctx = null;
  var body = [];
  var dir = 0;
  var lastPress = null;
  var pause = true;
  var gameOver = true;
  var score = 0;
  var wall = [];
  var food = null;
  //image variables
  var iBody = new Image();
  var iHead = new Image();
  var iFood = new Image();
  //audio variables
  var aEat = new Audio();
  var aDie = new Audio();
  var aPause = new Audio();

  //movement variables
  var keyEnter = 13;
  var keyLeft = 37,
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

  function random(max) {
    return ~~(Math.random() * max);
    }
  //Audio compatibility
  function canPlayOgg() {
    var aud = new Audio();
    if (aud.canPlayType('audio/ogg').replace(/no/, '')) {
      return true;
      } else {
      return false;
    }
  }
  //Rectangle
  function Rectangle(x, y, width, height) {
    this.x = (x === undefined) ? 0 : x;
    this.y = (y === undefined) ? 0 : y;
    this.width = (width === undefined) ? 0 : width;
    this.height = (height === undefined) ? this.width : height;
  }
  Rectangle.prototype.intersects = function (rect) {
    if (rect === undefined) {
      window.console.warn('Missing parameters on function intersects');
      } else {
      return (this.x < rect.x + rect.width &&
      this.x + this.width > rect.x &&
      this.y < rect.y + rect.height &&
      this.y + this.height > rect.y);
    }
  };
  Rectangle.prototype.fill = function (ctx) {
    if (ctx === undefined) {
      window.console.warn('Missing parameters on function fill');
      } else {
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  };
  Rectangle.prototype.drawImage = function (ctx, img) {
    if (img === undefined) {
      window.console.warn('Missing parameters on function drawImage');
      } else {
      if (img.width) {
      ctx.drawImage(img, this.x, this.y);
      } else {
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      }
    }
  };
  
  // Reset Function 
  function reset() {
    score = 0;
    dir = 1;
    body.length = 0;
    body.push(new Rectangle(40, 40, 10, 10));
    body.push(new Rectangle(0, 0, 10, 10));
    body.push(new Rectangle(0, 0, 10, 10));
    food.x = random(canvas.width / 10-1) * 10;
    food.y = random(canvas.height / 10-1) * 10;
    gameOver = false;
  }

  //DRAWINGS
  function paint (ctx) {
    var i = 0;
    var l = 0;
    //Canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //Player - Head
    for (i = 0, l = body.length; i < l ; i++) {
      ctx.drawImage(iBody, body[i].x, body[i].y);
    }
      ctx.drawImage(iHead, body[0].x, body[0].y);
    //Food
    ctx.drawImage(iFood, food.x, food.y);
    //Walls
    ctx.fillStyle = '#999';
    for (i=0, l = wall.length; i < l ; i++) {
      wall[i].fill(ctx);
    }
    // Score
    ctx.fillStyle = '#d37c66';
    ctx.fillText('Score: ' + score, 0, 10);
    //Last Key pressed
    //ctx.fillStyle = '#fff';
    //ctx.fillText('Last Press: ' + lastPress, 0, 20);

    //Pause
    if (pause) {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#d37c66';
      if(gameOver){
        ctx.fillText('GAME OVER', 150, 100);
      } else {
        ctx.fillText('PAUSE', 150, 100);
      }
      ctx.textAlign = 'left';
    }
  }

  function act() {
    var i = 0;
    var l = 0;
    if (!pause) {
      //Game Over Reset
      if (gameOver) {
        reset();
      }
      
      //Move body
      for (i = body.length - 1; i > 0 ; i--) {
        body[i].x = body[i-1].x;
        body[i].y = body[i-1].y;
      }

      //Change Direction
      if (lastPress === keyUp && dir !== 2) {
        dir = 0;
      }
      if (lastPress === keyRight && dir !== 3) {
        dir = 1;
      }
      if (lastPress === keyDown && dir !== 0) {
        dir = 2;
      }
      if (lastPress === keyLeft && dir !== 1) {
        dir = 3;
      }

      //Move Rect
      if (dir === 0) {
        body[0].y -= 10;
      }
      if (dir === 1) {
        body[0].x += 10;
      }
      if (dir === 2) {
        body[0].y += 10;
      }
      if (dir === 3) {
        body[0].x -= 10;
      }

      //Out Screen
      if (body[0].x > canvas.width - body[0].width) {
        body[0].x = 0;
      }
      if (body[0].y > canvas.height - body[0].height) {
        body[0].y = 0;
      }
      if (body[0].x < 0) {
        body[0].x = canvas.width - body[0].width;
      }
      if (body[0].y < 0) {
        body[0].y = canvas.height - body[0].height;
      }
      //Body Intersects
      for (i = 2, l = body.length; i < l; i++) {
        if(body[0].intersects(body[i])) {
          gameOver = true;
          pause = true;
          aDie.play();
        }
      }
      // Food Intersects
      if (body[0].intersects(food)) {
      body.push(new Rectangle(food.x, food.y, 10, 10));
      score += 1;
      food.x = random(canvas.width / 10 - 1) * 10;
      food.y = random(canvas.height / 10 - 1) * 10;
      aEat.play();
      }
      //Wall Intersects
      for (i = 0, l = wall.length; i < l; i++) {
        if(food.intersects(wall[i])) {
          food.x = random(canvas.width / 10-1) * 10;
          food.y = random(canvas.height / 10-1) * 10;
        }
        if(body[0].intersects(wall[i])) {
          pause = true;
          gameOver = true;
          aDie.play();
        }
      }
    }

  // Pause/Unpause
  if (lastPress === keyEnter) {
    pause = !pause;
    lastPress = undefined;
    aPause.play();
    }
  }

  //Refresh
  function repaint () {
    window.requestAnimationFrame(repaint);
    paint(ctx);
  }

  function run(){
    setTimeout(function() {
      window.requestAnimationFrame(run);
    }, 50);
    act();
    paint(ctx);
  }

  //Canvas init
  function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    //Player - Head
    body[0] = new Rectangle(40, 40, 10, 10);
    //Food
    food = new Rectangle(80, 80, 10, 10)
    //Walls
    wall.push(new Rectangle (100, 50, 10, 10));
    wall.push(new Rectangle (100, 100, 10, 10));
    wall.push(new Rectangle (100, 150, 10, 10));
    wall.push(new Rectangle (200, 50, 10, 10));
    wall.push(new Rectangle (200, 100, 10, 10));
    wall.push(new Rectangle (200, 150, 10, 10));
    //Load assets

    iBody.src = 'assets/body.png';
    iHead.src = 'assets/head.png';
    iFood.src = 'assets/fruit.png';
    if (canPlayOgg()) {
      aEat.src = 'assets/aeat.oga';
      aDie.src = 'assets/adie.oga';
      aPause.src = 'assets/apause.oga';
      } else {
      aEat.src = 'assets/aeat.wav';
      aDie.src = 'assets/adie.mp3';
      aPause.src = 'assets/apause.mp3';
      }
    
    // Start Game
    run();
    repaint();
  }

  window.addEventListener('load', init, false);
} (window)) ;