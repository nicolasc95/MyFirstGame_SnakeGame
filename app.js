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
  var extraFood = null;
  var tExtraFood = 0;
  //image variables
  var iBody = new Image();
  var iHead = new Image();
  var iFood = new Image();
  var iExtraFood = new Image();
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
  //RAF deltaTime variables
  var lastUpdate = 0;
  var FPS = 0;
  var frames = 0;
  var acumDelta = 0;
 //Buffer variables
  var buffer = null;
  var bufferCtx = null;
  var bufferScale = 1;
  var bufferOffsetX = 0;
  var bufferOffsetY = 0;
  //Scene variables
  var currentScene = 0;
  var scenes = [];
  var mainScene = null;
  var gameScene = null;
  var highscoresScene = null;
  //HighScores
  var highscores = [];
  var posHighscore = 10;
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
  //Change Scene
  function Scene() {
    this.id = scenes.length;
    scenes.push(this);
  }
  Scene.prototype = {
    constructor: Scene,
    load: function () {},
    paint: function (ctx) {},
    act: function () {}
  };
  function loadScene(scene) {
    currentScene = scene.id;
    scenes[currentScene].load();
  }

  // Main Scene
  mainScene = new Scene();
  mainScene.paint = function (ctx) {
    // Clean canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw title
    ctx.fillStyle = '#d37c66';
    ctx.textAlign = 'center';
    ctx.fillText('SNAKE', 150, 60);
    ctx.fillText('Press Enter to Start', 150, 120);
  };
  mainScene.act = function () {
    // Load next scene
    if (lastPress === keyEnter) {
      loadScene(gameScene);
      lastPress = null;
    }
  };

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

  //Run
  function run() {
    setTimeout(run, 50);
    if (scenes.length) {
      scenes[currentScene].act();
      }
    var now = Date.now(),
      deltaTime = (now - lastUpdate) / 1000;
    if (deltaTime > 1) {
      deltaTime = 0;
    }
    lastUpdate = now;

    frames += 1;
    acumDelta += deltaTime;
    if (acumDelta > 1) {
      FPS = frames;
      frames = 0;
      acumDelta -= 1;
    }
  }

  //Refresh
  function repaint () {
    window.requestAnimationFrame(repaint);
    if (scenes.length) {
      scenes[currentScene].paint(bufferCtx);
      }

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buffer, bufferOffsetX, bufferOffsetY, buffer.width * bufferScale, buffer.height * bufferScale);
  }

  // Game Scene
  gameScene = new Scene();

  // Reset Function 
  gameScene.load = function () {
    score = 0;
    dir = 1;
    body.length = 0;
    body.push(new Rectangle(40, 40, 10, 10));
    body.push(new Rectangle(0, 0, 10, 10));
    body.push(new Rectangle(0, 0, 10, 10));
    food.x = random(buffer.width / 10-1) * 10;
    food.y = random(buffer.height / 10-1) * 10;
    tExtraFood = Date.now() + 1000*(5 + random(10));
    extraFood.x = random(buffer.width / 10-1) * 10;
    extraFood.y = random(buffer.height / 10-1) * 10;
    gameOver = false;
  }

  //DRAWINGS
  gameScene.paint = function (ctx) {
    var i = 0;
    var l = 0;
    
    //Canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, buffer.width, buffer.height);

    //Player - Head
    for (i = 0, l = body.length; i < l ; i++) {
      ctx.drawImage(iBody, body[i].x, body[i].y);
    }
      ctx.drawImage(iHead, body[0].x, body[0].y);

    //Food
    ctx.drawImage(iFood, food.x, food.y);
    // ExtraFood
    ctx.fillStyle = '#ff0';
    if((Date.now() > tExtraFood)){
        extraFood.drawImage(ctx,iExtraFood);
    }
    //Walls
    ctx.fillStyle = '#999';
    for (i=0, l = wall.length; i < l ; i++) {
      wall[i].fill(ctx);
    }

    // Score
    ctx.fillStyle = '#d37c66';
    ctx.fillText('Score: ' + score, 0, 10);

    //FPS
    ctx.fillStyle = '#d37c66';
    ctx.fillText('FPS: ' + FPS, 250, 10);

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

  gameScene.act = function () {
    var i = 0;
    var l = 0;
    if (!pause) {
      //Game Over Reset
      if (gameOver) {
        addHighscore(score);
        loadScene(highscoresScene);
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
      if (body[0].x > buffer.width - body[0].width) {
        body[0].x = 0;
      }
      if (body[0].y > buffer.height - body[0].height) {
        body[0].y = 0;
      }
      if (body[0].x < 0) {
        body[0].x = buffer.width - body[0].width;
      }
      if (body[0].y < 0) {
        body[0].y = buffer.height - body[0].height;
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
      food.x = random(buffer.width / 10 - 1) * 10;
      food.y = random(buffer.height / 10 - 1) * 10;
      aEat.play();
      }
      //ExtraFood Intersects
      if ((body[0].intersects(extraFood)) && (Date.now() > tExtraFood)) {
        score += 5;
        postScore(score);
        extraFood.x = random(buffer.width / 10 - 1) * 10;
        extraFood.y = random(buffer.height / 10 - 1) * 10;
        aEat.play();
        tExtraFood = Date.now() + 1000*(5 + random(10));
      }
      //Wall Intersects
      for (i = 0, l = wall.length; i < l; i++) {
        if(food.intersects(wall[i])) {
          food.x = random(buffer.width / 10-1) * 10;
          food.y = random(buffer.height / 10-1) * 10;
        }
        if (extraFood.intersects(wall[i])) {
          extraFood.x = random(buffer.width / 10 - 1) * 10;
          extraFood.y = random(buffer.height / 10 - 1) * 10;
        }  
        if(body[0].intersects(wall[i])) {
          pause = true;
          gameOver = true;
          aDie.play();
        }
      }
    }else{
      tExtraFood = Date.now() + 1000*(5 + random(10));
  }
  //postScore
  function postScore(){
    fetch(`https://jsonplaceholder.typicode.com/posts/1?score=${score}`)
      .then((response) => response.json())
      .then((status) => console.log("Score sent successfully"))
      .catch((error) => console.log("Error trying to send the score"))
  }
  // Pause/Unpause
  if (lastPress === keyEnter) {
    pause = !pause;
    lastPress = undefined;
    aPause.play();
    }
  }

   //Resize canvas 
  function resize (){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var w = window.innerWidth / buffer.width;
    var h = window.innerHeight / buffer.height;
    bufferScale = Math.min(h, w);

    bufferOffsetX = (canvas.width - (buffer.width * bufferScale)) / 2;
    bufferOffsetY = (canvas.height - (buffer.height * bufferScale)) / 2;
  }

  //HighScores  
  function addHighscore(score) {
    posHighscore = 0;
    while (highscores[posHighscore] > score && posHighscore < highscores.length) {
      posHighscore += 1;
    }
    highscores.splice(posHighscore, 0, score);
    if (highscores.length > 10) {
      highscores.length = 10;
    }
    localStorage.highscores = highscores.join(',');
  }

  // Highscore Scene
  highscoresScene = new Scene();
  highscoresScene.paint = function (ctx) {
    var i = 0;
    var l = 0;
    // Clean canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, buffer.width, buffer.height);
    // Draw title
    ctx.fillStyle = '#d37c66';
    ctx.textAlign = 'center';
    ctx.fillText('HIGH SCORES', 150, 30);
    // Draw high scores
    ctx.textAlign = 'center';
    for (i = 0, l = highscores.length; i < l; i += 1) {
      if (i === posHighscore) {
        ctx.fillText('*' + highscores[i], 180, 40 + i * 10);
      } else {
        ctx.fillText(highscores[i], 180, 40 + i * 10);
      }
    }
  };
  highscoresScene.act = function () {
    // Load next scene
    if (lastPress === keyEnter) {
      loadScene(gameScene);
      lastPress = null;
    }
  };

  //Init
  function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = 600;
    canvas.height = 400;  

    //Buffer
    buffer = document.createElement('canvas');
    bufferCtx = buffer.getContext('2d');
    buffer.width = 300;
    buffer.height = 200;
    //Player - Head
    body[0] = new Rectangle(40, 40, 10, 10);

    //Food
    food = new Rectangle(80, 80, 10, 10)
    extraFood = new Rectangle (-10, -10, 10, 10)
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
    iExtraFood.src = 'assets/extraFood.png';
    if (canPlayOgg()) {
      aEat.src = 'assets/aeat.oga';
      aDie.src = 'assets/adie.oga';
      aPause.src = 'assets/apause.oga';
      } else {
      aEat.src = 'assets/aeat.wav';
      aDie.src = 'assets/adie.mp3';
      aPause.src = 'assets/apause.mp3';
      }
    //Load saved highscores
    if (localStorage.highscores) {
      highscores = localStorage.highscores.split(',');
    }
    // Start Game
    resize();
    run();
    repaint();
  }
  
  window.addEventListener('load', init, false);
  window.addEventListener('resize', resize, false);
} (window)) ;