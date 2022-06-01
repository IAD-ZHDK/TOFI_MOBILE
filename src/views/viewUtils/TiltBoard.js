//import { Tone } from 'tone/build/esm/core/Tone';
// references: https://codepen.io/HunorMarton/pen/VwKwgxX

const world = {
  gravity: 9.82,
  friction: 0.99,
  ballhardness: 0.9,
  angleScaling: 30,
  playerSensitivity: 0.008,
  collisionBoundary: 1.2,
  perspective: 0.0,
}

const board = {
  boardWidth: 200,
  boardHeight: 200,
  boardThickness: 50,
  angleX: 0,
  angleY: 0,
}

const player = {
  radius: 15,
  posX: 0,
  posY: 0,  // m
  posZ: 0,
  velX: 0,  // m/s^2
  velY: 0,
  speed: 0,
  mass: 1,    // kg
  collision: false,
}

const winningArea = {
  posX: 0,
  posY: 0,
  width: 1,
  height: 1,
  thickness: 1,
  name: "winningArea",
}

const startingArea = {
  posX: 0,
  posY: 0,
  width: 1,
  height: 1,
  thickness: 1,
  name: "startingArea",
}

class obstacle {
  constructor() {
    this.posX = 0;
    this.posY = 0;
    this.width = 1;
    this.height = 1;
    this.thickness = 100;
  }
}

const obstacle1 = {
  posX: 0,
  posY: 0,
  width: 1,
  height: 1,
  thickness: 100,
}

const obstacle2 = {
  posX: 0,
  posY: 0,
  width: 1,
  height: 1,
  thickness: 100,
}

const obstacle3 = {
  posX: 0,
  posY: 0,
  width: 1,
  height: 1,
  thickness: 100,
}

const wallLeft = {
  posX: 0,
  posY: 0,
  width: 1,
  height: 1,
  thickness: 100,
}

const wallRight = {
  posX: 0,
  posY: 0,
  width: 1,
  height: 1,
  thickness: 100,
}

const wallFront = {
  posX: 0,
  posY: 0,
  width: 1,
  height: 1,
  thickness: 100,
}

const wallBack = {
  posX: 0,
  posY: 0,
  width: 1,
  height: 1,
  thickness: 100,
}

class TiltBoard {
  constructor(p, width, height, params, Tone, envelopes, colorPallet) {
    this.obstacles = [];
    this.params = params;
    this.p = p;
    this.width = width;
    this.height = height;
    this.gameState = "setup";
    this.objectSetup();
    this.soundSetup(Tone);
    this.inputThreshold = 0.2;
    this.sphereTexture = this.p.loadImage('./img/checkerboard_pattern.png');
    this.colorPallet = colorPallet;
    this.colorwinningArea = this.p.color(0, 0, 0);
    this.colorWalls = this.p.color(this.colorPallet[1]);
    this.colorBoard = this.p.color(this.colorPallet[3]);
    this.colorObstacle1 = this.p.color(this.colorPallet[2])
    this.colorObstacle2 = this.colorObstacle1;
    this.colorObstacle3 = this.colorObstacle2;

  }

  soundSetup(Tone) {
    //Control Variables
    //1
    let chorus1Speed = "16n";
    let chorus1DelayInterval = 4;
    let chorus1Depth = 0.05;
    let reverb1Decay = 1.5;
    let reverb1Wet = 0.6;

    //2
    let chorus2Speed = "16n";
    let chorus2DelayInterval = 4;
    let chorus2Depth = 0.05;
    let reverb2Decay = 1.5;
    let reverb2Wet = 0.6;

    //3
    let chorus3Speed = "16n";
    let chorus3DelayInterval = 4;
    let chorus3Depth = 0.05;
    let reverb3Decay = 1.5;
    let reverb3Wet = 0.6;

    //4
    let chorus4Speed = "16n";
    let chorus4DelayInterval = 4;
    let chorus4Depth = 0.05;
    let reverb4Decay = 1.5;
    let reverb4Wet = 0.6;

    //5
    let delayInterval = "8n";
    let delayFeedback = 0.3;
    let reverb5Decay = 2;
    let reverb5Wet = 0.7;

    //General
    let volumeDry = -8;
    let bpmValue = 80;



    this.synth1 = new Tone.MonoSynth();
    this.synth2 = new Tone.MonoSynth();
    this.synth3 = new Tone.MonoSynth();
    this.synth4 = new Tone.MonoSynth();
    this.synth5 = new Tone.MonoSynth();

    this.chorus1 = new Tone.Chorus(chorus1Speed, chorus1DelayInterval, chorus1Depth).start();
    this.chorus2 = new Tone.Chorus(chorus2Speed, chorus2DelayInterval, chorus2Depth).start();
    this.chorus3 = new Tone.Chorus(chorus3Speed, chorus3DelayInterval, chorus3Depth).start();
    this.chorus4 = new Tone.Chorus(chorus4Speed, chorus4DelayInterval, chorus4Depth).start();

    this.pingpongdelay = new Tone.PingPongDelay(delayInterval, delayFeedback);

    this.reverb1 = new Tone.Reverb(reverb1Decay);
    this.reverb2 = new Tone.Reverb(reverb2Decay);
    this.reverb3 = new Tone.Reverb(reverb3Decay);
    this.reverb4 = new Tone.Reverb(reverb4Decay);
    this.reverb5 = new Tone.Reverb(reverb5Decay);


    this.volDry = new Tone.Volume(volumeDry);

    //
    this.params.toneObjects = []; // important! all tone.js objects need to be tracked in order to dispose after use.
    this.params.toneObjects.push(this.synth1);
    this.params.toneObjects.push(this.synth2);
    this.params.toneObjects.push(this.synth3);
    this.params.toneObjects.push(this.synth4);
    this.params.toneObjects.push(this.synth5);

    this.params.toneObjects.push(this.chorus1);
    this.params.toneObjects.push(this.chorus2);
    this.params.toneObjects.push(this.chorus3);
    this.params.toneObjects.push(this.chorus4);

    this.params.toneObjects.push(this.reverb1);
    this.params.toneObjects.push(this.reverb2);
    this.params.toneObjects.push(this.reverb3);
    this.params.toneObjects.push(this.reverb4);
    this.params.toneObjects.push(this.reverb5);

    this.params.toneObjects.push(this.volDry);



    //


    //set parameters for synths and FX's
    // Tone.Transport.bpm.value = bpmValue;

    this.reverb1.wet.value = reverb1Wet;
    this.reverb2.wet.value = reverb2Wet;
    this.reverb3.wet.value = reverb3Wet;
    this.reverb4.wet.value = reverb4Wet;
    this.reverb5.wet.value = reverb5Wet;

    this.synth1.filterEnvelope.attack = 0.2;
    //this.synth1.filter.frequency = 1000;
    this.synth1.envelope.attack = 1;
    this.synth1.envelope.decay = 0.0;
    this.synth1.envelope.sustain = 1;
    this.synth1.envelope.attackCurve = "linear";
    this.synth1.envelope.release = 0.8;
    this.synth1.oscillator.type = "sine";
    this.synth1.volume.value = -2;

    this.synth2.filterEnvelope.attack = 0.2;
    //this.synth2.filter.frequency = 400;
    this.synth2.envelope.attack = 1;
    this.synth2.envelope.decay = 0.0;
    this.synth2.envelope.sustain = 1;
    this.synth2.envelope.attackCurve = "linear";
    this.synth2.envelope.release = 0.8;
    this.synth2.oscillator.type = "sine";
    this.synth2.volume.value = -2;

    this.synth3.filterEnvelope.attack = 0.2;
    //this.synth3.filter.frequency = 400;
    this.synth3.envelope.attack = 1;
    this.synth3.envelope.decay = 0.0;
    this.synth3.envelope.sustain = 1;
    this.synth3.envelope.attackCurve = "linear";
    this.synth3.envelope.release = 0.8;
    this.synth3.oscillator.type = "sine";
    this.synth3.volume.value = -2;

    this.synth4.filterEnvelope.attack = 0.2;
    //this.synth4.filter.frequency = 400;
    this.synth4.envelope.attack = 1;
    this.synth4.envelope.decay = 0.0;
    this.synth4.envelope.sustain = 1;
    this.synth4.envelope.attackCurve = "linear";
    this.synth4.envelope.release = 0.8;
    this.synth4.oscillator.type = "sine";
    this.synth4.volume.value = -2;

    this.synth5.filterEnvelope.attack = 0.2;
    //this.synth5.filter.frequency = 400;
    this.synth5.envelope.attack = 0.1;
    this.synth5.envelope.decay = 0.0;
    this.synth5.envelope.sustain = 1;
    this.synth5.envelope.attackCurve = "linear";
    this.synth5.envelope.release = 0.6;
    this.synth5.oscillator.type = "sawtooth";
    this.synth5.volume.value = -2;


    //route signals
    this.synth1.chain(this.chorus1, this.reverb1, this.volDry);
    this.synth2.chain(this.chorus2, this.reverb2, this.volDry);
    this.synth3.chain(this.chorus3, this.reverb3, this.volDry);
    this.synth4.chain(this.chorus4, this.reverb4, this.volDry);
    this.synth5.chain(this.pingpongdelay, this.reverb5, this.volDry);
    this.volDry.toDestination();

  }

  objectSetup() {

    if (this.height <= this.width) {
      board.boardWidth = this.height * .8;
      board.boardHeight = board.boardWidth;
    }
    else {
      board.boardWidth = this.width * .8;
      board.boardHeight = board.boardWidth;
    }

    startingArea.posX = board.boardWidth / 200 * 0;
    startingArea.posY = -board.boardWidth / 200 * 0;
    startingArea.width = board.boardWidth / 100 * 10;
    startingArea.height = board.boardWidth / 100 * 10;
    startingArea.thickness = 1;

    player.posX = startingArea.posX;
    player.posY = startingArea.posY;
    player.radius = board.boardWidth / 30;

    winningArea.posX = board.boardWidth / 200 * 0;
    winningArea.posY = -board.boardWidth / 200 * 90;
    winningArea.width = board.boardWidth / 100 * 10;
    winningArea.height = board.boardWidth / 100 * 10;
    winningArea.thickness = 1;

    let tempObstacle = new obstacle()
    tempObstacle.posX = board.boardWidth / 200 * 50;
    tempObstacle.posY = -board.boardWidth / 200 * 10;
    tempObstacle.width = board.boardWidth / 100 * 30;
    tempObstacle.height = board.boardWidth / 100 * 4;

    this.obstacles.push(tempObstacle)

    let tempObstacle1 = new obstacle()
    tempObstacle1.posX = -board.boardWidth / 200 * 60;
    tempObstacle1.posY = board.boardWidth / 200 * 40;
    tempObstacle1.width = board.boardWidth / 100 * 8;
    tempObstacle1.height = board.boardWidth / 100 * 45;

    this.obstacles.push(tempObstacle1)

    let tempObstacle2 = new obstacle()
    tempObstacle2.posX = - board.boardWidth / 200 * 30;
    tempObstacle2.posY = - board.boardWidth / 200 * 40;
    tempObstacle2.width = board.boardWidth / 100 * 30;
    tempObstacle2.height = board.boardWidth / 100 * 2;

    this.obstacles.push(tempObstacle2)

    wallLeft.posX = -board.boardWidth / 2;
    wallLeft.posY = 0;
    wallLeft.width = 3;
    wallLeft.height = board.boardHeight;

    wallRight.posX = board.boardWidth / 2;
    wallRight.posY = 0;
    wallRight.width = 3;
    wallRight.height = board.boardHeight;

    wallFront.posX = 0;
    wallFront.posY = board.boardHeight / 2;
    wallFront.width = board.boardWidth;
    wallFront.height = 3;

    wallBack.posX = 0;
    wallBack.posY = -board.boardHeight / 2;
    wallBack.width = board.boardWidth;
    wallBack.height = 3;
  }

  drawPlayer() {
    this.p.texture(this.sphereTexture);
    this.p.push();
    this.p.translate(player.posX, player.posY, player.posZ + player.radius);
    this.p.push();
    // rotate ball
    //ball.velX * nx + ball.velY * ny;
    this.p.rotateY(player.posX * 0.05);
    this.p.rotateX(player.posY * -0.05);
    this.p.sphere(player.radius);
    this.p.pop();
    this.p.pop();
  }

  drawBoard() {
    this.p.normalMaterial();
    this.p.push();
    this.p.translate(0, 0, -board.boardThickness / 2);
    this.p.translate(0, 0, 0);
    this.p.rotateX(-board.angleX * world.angleScaling);
    this.p.rotateY(board.angleY * world.angleScaling);
    this.p.fill(this.colorBoard);
    this.p.box(board.boardWidth, board.boardHeight, board.boardThickness);



    // draw obsticals 
    for (let i = 0; i < this.obstacles.length; i++) {
      this.p.push();
      this.p.translate(this.obstacles[i].posX, this.obstacles[i].posY, 0);
      this.p.fill(this.colorObstacle1);
      this.p.box(this.obstacles[i].width, this.obstacles[i].height, this.obstacles[i].thickness);
      this.p.pop();
      this.p.push();
    }

    this.p.translate(wallFront.posX, wallFront.posY, 0);
    this.p.fill(this.colorWalls);
    this.p.box(wallFront.width, wallFront.height, wallFront.thickness);
    this.p.pop();
    this.p.push();
    this.p.translate(wallBack.posX, wallBack.posY, 0);
    this.p.fill(this.colorWalls);
    this.p.box(wallBack.width, wallBack.height, wallBack.thickness);
    this.p.pop();
    this.p.push();
    this.p.translate(wallLeft.posX, wallLeft.posY, 0);
    this.p.fill(this.colorWalls);
    this.p.box(wallLeft.width, wallLeft.height, wallLeft.thickness);
    this.p.pop();
    this.p.push();
    this.p.translate(wallRight.posX, wallRight.posY, 0);
    this.p.fill(this.colorWalls);
    this.p.box(wallRight.width, wallRight.height, wallRight.thickness);
    this.p.pop();
    this.p.push();
    this.p.translate(winningArea.posX, winningArea.posY, board.boardThickness / 20 * 11);
    this.p.fill(this.colorwinningArea);
    this.p.circle(0, 0, winningArea.width);
    this.p.pop();
    this.p.pop();
  }


  resolveRectCircleCollision(ball, obstacle) {
    // https://stackoverflow.com/questions/55419162/corner-collision-angles-in-p5-js
    var hx = 0.5 * obstacle.width
    var hy = 0.5 * obstacle.height;
    //var rx = obstacle.posX + hx
    //var ry = obstacle.posY + hy;
    var rx = obstacle.posX;
    var ry = obstacle.posY;
    var dx = ball.posX - rx, dy = ball.posY - ry;

    var sx = dx < -hx ? -1 : (dx > hx ? 1 : 0);
    var sy = dy < -hy ? -1 : (dy > hy ? 1 : 0);

    var tx = sx * (Math.abs(dx) - hx);
    var ty = sy * (Math.abs(dy) - hy);
    var dc = Math.hypot(tx, ty);
    if (dc > ball.radius) {
      // no collision 
      return false;
    }

    var nx = 0, ny = 0, nl = 0;

    if (sx == 0 && sy == 0) {
      nx = dx > 0 ? 1 : -1; ny = dy > 0 ? 1 : -1;
      nl = Math.hypot(nx, ny);
    } else {
      nx = tx; ny = ty;
      nl = dc;
    }

    nx /= nl;
    ny /= nl;
    // avoid penetration
    ball.posX += (ball.radius - dc) * nx;
    ball.posY += (ball.radius - dc) * ny;
    var dv = ball.velX * nx + ball.velY * ny;

    if (dv >= 0.0) {
      /* exit and don't do anything else */
      // console.log("dv"+dv)
      return false;
    }
    // reflect the ball's velocity in direction of the normal
    ball.velX -= 2.0 * dv * nx;
    ball.velY -= 2.0 * dv * ny;
    return true;
  }

  collisionDetectionWinning(ball, obstacle) {
    let left = (obstacle.posX + obstacle.width / 2)
    let right = (obstacle.posX - obstacle.width / 2)
    let top = (obstacle.posY + obstacle.height / 2)
    let btm = (obstacle.posY - obstacle.height / 2)
    let leftInside = left > (player.posX - player.radius)
    let rightInside = right < (player.posX + player.radius)
    let topInside = top > (player.posY - player.radius)
    let btmInside = btm < (player.posY + player.radius)
    if (leftInside && rightInside && topInside && btmInside) {
      if (obstacle.name == "winningArea") {
        if (this.gameState == "maze") {
          this.gameState = "won";
          // winning sound
          this.synth5.triggerAttackRelease("G5", "16n");
        }
      }
    }
  }



  collisionPlacing(collidingObject, collisionObject) {
    // check if objects are overlaping 
    if ((collisionObject.posX + collisionObject.width / 2) > (collidingObject.posX - collidingObject.width) && (collisionObject.posX - collisionObject.width / 2) < (collidingObject.posX + collidingObject.width)) {
      if ((collisionObject.posY + collisionObject.height / 2) > (collidingObject.posY - collidingObject.height) && (collisionObject.posY - collisionObject.height / 2) < (collidingObject.posY + collidingObject.height)) {
        return true;
      }
    }
  }



  generateWinningArea() {
    // check collisions 
    let coliding = false
    let tryCount = 0;
    do {
      tryCount++;
      if (tryCount>40) {
        this.initializeGame();
        break;
      }
      console.log("try new winning area")
      coliding = false;
      // make sure winning area is never too close to midle 
      var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
      let distanceFromMiddleX = this.p.random(0.2, 0.45)
      let distanceFromMiddleY = this.p.random(0.2, 0.45)
      // random left/right and up/down
      distanceFromMiddleX = distanceFromMiddleX* (Math.random() < 0.5 ? -1 : 1);
      distanceFromMiddleY = distanceFromMiddleY* (Math.random() < 0.5 ? -1 : 1);
      winningArea.posX = distanceFromMiddleX * board.boardWidth
      winningArea.posY = distanceFromMiddleX * board.boardHeight
      for (let i = 0; i < this.obstacles.length; i++) {
        if (this.collisionPlacing(this.obstacles[i], winningArea) == true) {
          coliding = true;
        }
      }
    } while (coliding == true)

  }


  generateObstaclesv1() {
    obstacle1.width = this.p.random(board.boardWidth / 100 * 25, board.boardWidth / 100 * 38);
    obstacle1.height = this.p.random(board.boardWidth / 100 * 2, board.boardWidth / 100 * 15);
    obstacle1.posX = this.p.random(1 * (- board.boardWidth / 2 + obstacle1.width), 1 * (board.boardWidth / 2 - obstacle1.width));
    obstacle1.posY = this.p.random(1 * (- board.boardHeight / 2 + obstacle1.height), 1 * (board.boardHeight / 2 - obstacle1.height));

    while (this.collisionPlacing(startingArea, obstacle1) == true) {
      obstacle1.posX = this.p.random(1 * (- board.boardWidth / 2 + obstacle1.width), 1 * (board.boardWidth / 2 - obstacle1.width));
      obstacle1.posY = this.p.random(1 * (- board.boardHeight / 2 + obstacle1.height), 1 * (board.boardHeight / 2 - obstacle1.height));
    }

    obstacle2.width = this.p.random(board.boardWidth / 100 * 3, board.boardWidth / 100 * 25);
    obstacle2.height = this.p.random(board.boardWidth / 100 * 20, board.boardWidth / 100 * 48);
    obstacle2.posX = this.p.random(1 * (- board.boardWidth / 2 + obstacle2.width), 1 * (board.boardWidth / 2 - obstacle2.width));
    obstacle2.posY = this.p.random(1 * (- board.boardHeight / 2 + obstacle2.height), 1 * (board.boardHeight / 2 - obstacle2.height));

    while (this.collisionPlacing(obstacle1, obstacle2) == true || this.collisionPlacing(startingArea, obstacle2) == true) {
      obstacle2.posX = this.p.random(1 * (- board.boardWidth / 2 + obstacle2.width), 1 * (board.boardWidth / 2 - obstacle2.width));
      obstacle2.posY = this.p.random(1 * (- board.boardHeight / 2 + obstacle2.height), 1 * (board.boardHeight / 2 - obstacle2.height));
    }

    obstacle3.width = this.p.random(board.boardWidth / 100 * 15, board.boardWidth / 100 * 42);
    obstacle3.height = this.p.random(board.boardWidth / 100 * 6, board.boardWidth / 100 * 18);
    obstacle3.posX = this.p.random(1 * (- board.boardWidth / 2 + obstacle3.width), 1 * (board.boardWidth / 2 - obstacle3.width));
    obstacle3.posY = this.p.random(1 * (- board.boardHeight / 2 + obstacle3.height), 1 * (board.boardHeight / 2 - obstacle3.height));

    while ((this.collisionPlacing(obstacle1, obstacle3) == true) || (this.collisionPlacing(obstacle2, obstacle3) == true) || this.collisionPlacing(startingArea, obstacle3) == true) {
      obstacle3.posX = this.p.random(1 * (- board.boardWidth / 2 + obstacle3.width), 1 * (board.boardWidth / 2 - obstacle3.width));
      obstacle3.posY = this.p.random(1 * (- board.boardHeight / 2 + obstacle3.height), 1 * (board.boardHeight / 2 - obstacle3.height));
    }
  }

  generateObstacles() {
    this.obstacles = []
    let tempObstacle;
    do {
      console.log("try1")
      tempObstacle = this.generateObsticle();
    } while (this.collisionPlacing(startingArea, tempObstacle) == true)
    this.obstacles.push(tempObstacle)

    let tempObstacle2
    do {
      console.log("try2")
      tempObstacle2 = this.generateObsticle();
    } while (this.collisionPlacing(startingArea, tempObstacle2) == true || this.collisionPlacing(tempObstacle, tempObstacle2) == true)
    this.obstacles.push(tempObstacle2)

    let tempObstacle3 = new obstacle()
    do {
      console.log("try3")
      tempObstacle3 = this.generateObsticle();
    } while (this.collisionPlacing(startingArea, tempObstacle3) == true || this.collisionPlacing(tempObstacle, tempObstacle3) == true || this.collisionPlacing(tempObstacle2, tempObstacle3) == true)
    this.obstacles.push(tempObstacle3)

    let tempObstacle4 = new obstacle()
    do {
      console.log("try4")
      tempObstacle4 = this.generateObsticle();
    } while (this.collisionPlacing(startingArea, tempObstacle4) == true || this.collisionPlacing(tempObstacle, tempObstacle4) == true || this.collisionPlacing(tempObstacle2, tempObstacle4) == true)
    this.obstacles.push(tempObstacle4)


  }

  generateObsticle() {
    let tempObstacle = new obstacle()
    tempObstacle.width = this.p.random(board.boardWidth * .1, board.boardWidth * .3);
    tempObstacle.height = this.p.random(board.boardHeight * .1, board.boardHeight * .3);
    tempObstacle.posX = this.p.random(1 * (- board.boardWidth / 2 + tempObstacle.width), 1 * (board.boardWidth / 2 - tempObstacle.width));
    tempObstacle.posY = this.p.random(1 * (- board.boardHeight / 2 + tempObstacle.height), 1 * (board.boardHeight / 2 - tempObstacle.height));
    return tempObstacle
  }

  initializeGame() {
    this.objectSetup();
    //random obstacle generator - gets sometimes stuck in while loop in generateObstacles()
    this.generateObstacles();
    //random winning area generator 
    this.generateWinningArea();
  }

  updateInputs() {
    //let sensorValues = this.params.getNormalisedActiveValues()
    let sensors = this.params.getSensorsUpdates();
    let tiltforward = sensors.forward
    let tiltBack = sensors.back
    if (sensors.back.active == false) {
      // for the case the rear sensor is disabled 
      tiltforward = sensors.exterior
      tiltBack = sensors.forward
    }
    //tilt of two axis only in one direction per axis
    if (tiltBack.value >= this.inputThreshold) {
      board.angleX = board.angleX * 0.9;
      board.angleX += (tiltBack.value * world.playerSensitivity) * 0.1;
      this.synth2.triggerAttack("D3");
    }
    else if (tiltforward.value  >= this.inputThreshold) {
      board.angleX = board.angleX * 0.9;
      board.angleX += 0 - (tiltforward.value * world.playerSensitivity) * 0.1;
      this.synth1.triggerAttack("A3");
    } else {
      this.synth2.triggerRelease();
      this.synth1.triggerRelease();
      board.angleX = board.angleX * 0.9;
    }

    if (sensors.left.value  >= this.inputThreshold) {
      board.angleY = board.angleY * 0.9;
      board.angleY += 0 - (sensors.left.value * world.playerSensitivity) * 0.1;
      this.synth4.triggerAttack("F3");
    }

    else if (sensors.right.value  >= this.inputThreshold) {
      board.angleY = board.angleY * 0.9;
      board.angleY += (sensors.right.value * world.playerSensitivity) * 0.1;
      this.synth3.triggerAttack("G3");
    } 
    else {
      board.angleY = board.angleY * 0.9;
      // board.angleY += 0*0.1;
      this.synth4.triggerRelease();
      this.synth3.triggerRelease();
    }
  }

  update() {
    this.updateInputs();


    // update player 

    player.velX += world.gravity * Math.sin(board.angleY);
    player.velY += world.gravity * Math.sin(board.angleX);
    player.velX = world.friction * player.velX;
    player.velY = world.friction * player.velY;
    //
    //player.speedX = player.speedX + player.velX;
    //player.speedY = player.speedY + player.velY;
    player.posX = player.posX + player.velX;
    player.posY = player.posY + player.velY;

    // collisions
    for (let i = 0; i < this.obstacles.length; i++) {
      //this.collisionDetection2(player, this.obstacles[i]);
      //this.collisionDetection2(this.obstacles[i]);
      this.resolveRectCircleCollision(player, this.obstacles[i])
    }

    this.resolveRectCircleCollision(player, wallLeft);
    this.resolveRectCircleCollision(player, wallRight);
    this.resolveRectCircleCollision(player, wallFront);
    this.resolveRectCircleCollision(player, wallBack);
    this.collisionDetectionWinning(player, winningArea);

    player.collision = false;

    if (this.gameState == "next") {
      // player.velX = 0;
      // player.velY = 0;
      player.posZ = player.posZ - 0.3;
      player.posX = player.posX + (winningArea.posX - player.posX) * 0.1;
      player.posY = player.posY + (winningArea.posY - player.posY) * 0.1;
    }
    else {
      player.posZ = -(player.posX * Math.sin(board.angleY * world.angleScaling) + player.posY * Math.sin(board.angleX * world.angleScaling));
    }
  }


  draw() {
    this.p.rotateX(world.perspective);
    this.p.directionalLight(this.colorBoard, 0, 0, -1);
    this.p.ambientLight(255);
    if (this.gameState != "won") {
      this.update();
    }
    this.drawPlayer();
    this.drawBoard();
  }
}
export default TiltBoard