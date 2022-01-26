import { Tone } from 'tone/build/esm/core/Tone';

const world = {
    gravity: 9.82,
    friction: 0.02,
    ballhardness: 0.7,
    angleScaling: 20,
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
    accX: 0,  // m/s^2
    accY: 0,
    speedX: 0,  // m/s
    speedY: 0,
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
    constructor(p, width, height, params, Tone, envelopes) {
        this.params = params;
        this.p = p;
        this.width = width;
        this.height = height;
        this.gameState = "intro";
        this.objectSetup();
        this.soundSetup(Tone);
        this.inputThreshold = 0.1;
        this.sphereTexture = this.p.loadImage('./img/sphere_texture_checkered.jpeg');
        this.p.colorMode(this.p.HSB);
        this.colorPallet = [196, 330, 36, 159, 312, 60, 250];
        this.colorwinningArea = this.p.color(this.colorPallet[4],255,255);
        this.colorWalls = this.p.color(this.colorPallet[6],255,70);
        this.colorBoard = this.p.color(this.colorPallet[0],255,355);
        this.colorObstacle1 = this.p.color(this.colorPallet[2],255,100)
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

    objectSetup () {
        if (this.height <= this.width){
          board.boardWidth = this.height * 1 / 3;
          board.boardHeight = board.boardWidth;
        }
        else {
          board.boardWidth = this.width * 2 / 3;
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

        obstacle1.posX = board.boardWidth / 200 * 50;
        obstacle1.posY = -board.boardWidth / 200 * 10;
        obstacle1.width = board.boardWidth / 100 * 30;
        obstacle1.height = board.boardWidth / 100 * 4;

        obstacle2.posX = -board.boardWidth / 200 * 60;
        obstacle2.posY = board.boardWidth / 200 * 40;
        obstacle2.width = board.boardWidth / 100 * 8;
        obstacle2.height = board.boardWidth / 100 * 45;

        obstacle3.posX = - board.boardWidth / 200 * 30;
        obstacle3.posY = - board.boardWidth / 200 * 40;
        obstacle3.width = board.boardWidth / 100 * 30;
        obstacle3.height = board.boardWidth / 100 * 2;

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

    drawPlayer () {
        this.p.texture(this.sphereTexture);
        this.p.push();
            this.p.translate(player.posX, player.posY, player.posZ + player.radius);
            this.p.push();
            // rotate ball
            this.p.rotateY(player.posX * 0.1);
            this.p.rotateX(player.posY * 0.1);
            this.p.sphere(player.radius);
            this.p.pop();
        this.p.pop();
    }

    drawBoard () {
        this.p.normalMaterial();
        this.p.push();
            this.p.translate(0, 0, -board.boardThickness / 2);
            this.p.translate(0, 0, 0);
            this.p.rotateX(-board.angleX * world.angleScaling);
            this.p.rotateY(board.angleY * world.angleScaling);
            this.p.fill(this.colorBoard);
            this.p.box(board.boardWidth, board.boardHeight, board.boardThickness);

        
            this.p.push();
            this.p.translate(obstacle1.posX, obstacle1.posY,0);
            this.p.fill(this.colorObstacle1);
            this.p.box(obstacle1.width, obstacle1.height, obstacle1.thickness);
            this.p.pop();
            this.p.push();
            this.p.translate(obstacle2.posX, obstacle2.posY,0);
            this.p.fill(this.colorObstacle2);
            this.p.box(obstacle2.width, obstacle2.height, obstacle2.thickness);
            this.p.pop();
            this.p.push();
            this.p.translate(obstacle3.posX, obstacle3.posY,0);
            this.p.fill(this.colorObstacle3);
            this.p.box(obstacle3.width, obstacle3.height, obstacle3.thickness);
            this.p.pop();
            this.p.push();
            this.p.translate(wallFront.posX, wallFront.posY,0);
            this.p.fill(this.colorWalls);
            this.p.box(wallFront.width, wallFront.height, wallFront.thickness);
            this.p.pop();
            this.p.push();
            this.p.translate(wallBack.posX, wallBack.posY,0);
            this.p.fill(this.colorWalls);
            this.p.box(wallBack.width, wallBack.height, wallBack.thickness);
            this.p.pop();
            this.p.push();
            this.p.translate(wallLeft.posX, wallLeft.posY,0);
            this.p.fill(this.colorWalls);
            this.p.box(wallLeft.width, wallLeft.height, wallLeft.thickness);
            this.p.pop();
            this.p.push();
            this.p.translate(wallRight.posX, wallRight.posY,0);
            this.p.fill(this.colorWalls);
            this.p.box(wallRight.width, wallRight.height, wallRight.thickness);
            this.p.pop();
            this.p.push();
            this.p.translate(winningArea.posX, winningArea.posY, board.boardThickness / 20 * 11);
            this.p.fill(this.colorwinningArea);
            this.p.circle(0,0,winningArea.width);
            this.p.pop();
        this.p.pop();
    }

    calculateFriction () {
        player.speedX = player.speedX - world.friction * player.speedX;
        player.speedY = player.speedY - world.friction * player.speedY;
    }

    collisionDetection (collisionObject) {
        if ((collisionObject.posX + collisionObject.width / 2) > (player.posX + (1 + world.collisionBoundary) * player.speedX - player.radius) && (collisionObject.posX - collisionObject.width / 2) < (player.posX + (1 + world.collisionBoundary) * player.speedX + player.radius)) {
            if ((collisionObject.posY + collisionObject.height / 2) > (player.posY + (1 + world.collisionBoundary) * player.speedY - player.radius) && (collisionObject.posY - collisionObject.height / 2) < (player.posY + (1 + world.collisionBoundary) * player.speedY + player.radius)) {
              if (collisionObject.name == "winningArea"){
                if (this.gameState == "maze"){
                  this.gameState = "won";
                  // winning sound
                  this.synth5.triggerAttackRelease("G5", "16n");
                }
              }
              else {
                if ((collisionObject.posY - collisionObject.height / 2) > player.posY + player.radius || (collisionObject.posY + collisionObject.height / 2) < player.posY - player.radius) {
                  this.collisionReaction("y");
                }
                else if ((collisionObject.posX - collisionObject.width / 2) > player.posX + player.radius || (collisionObject.posX + collisionObject.width / 2) < player.posX - player.radius) {
                  this.collisionReaction("x");
                }
                player.collision = true;
              }
            }
          }
    }

    collisionPlacing (collidingObject, collisionObject) {
      if ((collisionObject.posX + collisionObject.width / 2) > (collidingObject.posX - collidingObject.width) && (collisionObject.posX - collisionObject.width / 2) < (collidingObject.posX + collidingObject.width)) {
        if ((collisionObject.posY + collisionObject.height / 2) > (collidingObject.posY - collidingObject.height) && (collisionObject.posY - collisionObject.height / 2) < (collidingObject.posY + collidingObject.height)) {
            return true;
        }
      }
    }

    collisionReaction (axis) {
        switch (axis) {
            case "x":
              player.posX = player.posX - player.speedX * world.collisionBoundary;
              player.speedX = - player.speedX * world.ballhardness;            
              break;
            case "y":
              player.posY = player.posY - player.speedY * world.collisionBoundary;
              player.speedY = - player.speedY * world.ballhardness;
              break;
          }
    }

    

    generateWinningArea () {
      winningArea.posX = this.p.random( - board.boardWidth / 200 * 90, board.boardWidth / 200 * 90);
      winningArea.posY = this.p.random( - board.boardWidth / 200 * 90, board.boardWidth / 200 * 90);
      while (this.collisionPlacing(obstacle1, winningArea) == true || this.collisionPlacing(obstacle2, winningArea) == true || this.collisionPlacing(obstacle3, winningArea) == true || this.collisionPlacing(startingArea, winningArea) == true) {
        winningArea.posX = this.p.random( - board.boardWidth / 200 * 90, board.boardWidth / 200 * 90);
        winningArea.posY = this.p.random( - board.boardWidth / 200 * 90, board.boardWidth / 200 * 90);
      }
    }

    generateObstacles () {
      obstacle1.width = this.p.random( board.boardWidth / 100 * 25, board.boardWidth / 100 * 38);
      obstacle1.height = this.p.random( board.boardWidth / 100 * 2, board.boardWidth / 100 * 15);
      obstacle1.posX = this.p.random( 1 * (- board.boardWidth / 2 + obstacle1.width), 1 * (board.boardWidth / 2 - obstacle1.width));
      obstacle1.posY = this.p.random( 1 * ( - board.boardHeight / 2 + obstacle1.height), 1 * (board.boardHeight / 2 - obstacle1.height));
      
      while (this.collisionPlacing(startingArea, obstacle1) == true) {
        obstacle1.posX = this.p.random( 1 * (- board.boardWidth / 2 + obstacle1.width), 1 * (board.boardWidth / 2 - obstacle1.width));
        obstacle1.posY = this.p.random( 1 * ( - board.boardHeight / 2 + obstacle1.height), 1 * (board.boardHeight / 2 - obstacle1.height));
      }

      obstacle2.width = this.p.random( board.boardWidth / 100 * 3, board.boardWidth / 100 * 25);
      obstacle2.height = this.p.random( board.boardWidth / 100 * 20, board.boardWidth / 100 * 48);
      obstacle2.posX = this.p.random( 1 * (- board.boardWidth / 2 + obstacle2.width), 1 * (board.boardWidth / 2 - obstacle2.width));
      obstacle2.posY = this.p.random( 1 * ( - board.boardHeight / 2 + obstacle2.height), 1 * (board.boardHeight / 2 - obstacle2.height));

      while (this.collisionPlacing(obstacle1, obstacle2) == true  || this.collisionPlacing(startingArea, obstacle2) == true) {
        obstacle2.posX = this.p.random( 1 * (- board.boardWidth / 2 + obstacle2.width), 1 * (board.boardWidth / 2 - obstacle2.width));
        obstacle2.posY = this.p.random( 1 * ( - board.boardHeight / 2 + obstacle2.height), 1 * (board.boardHeight / 2 - obstacle2.height));
      }

      obstacle3.width = this.p.random( board.boardWidth / 100 * 15, board.boardWidth / 100 * 42);
      obstacle3.height = this.p.random( board.boardWidth / 100 * 6, board.boardWidth / 100 * 18);
      obstacle3.posX = this.p.random( 1 * (- board.boardWidth / 2 + obstacle3.width), 1 * (board.boardWidth / 2 - obstacle3.width));
      obstacle3.posY = this.p.random( 1 * ( - board.boardHeight / 2 + obstacle3.height), 1 * (board.boardHeight / 2 - obstacle3.height));

      while ((this.collisionPlacing(obstacle1, obstacle3) == true) || (this.collisionPlacing(obstacle2, obstacle3) == true)  || this.collisionPlacing(startingArea, obstacle3) == true) {
        obstacle3.posX = this.p.random( 1 * (- board.boardWidth / 2 + obstacle3.width), 1 * (board.boardWidth / 2 - obstacle3.width));
        obstacle3.posY = this.p.random( 1 * ( - board.boardHeight / 2 + obstacle3.height), 1 * (board.boardHeight / 2 - obstacle3.height));
      }
    }

    initializeGame () {
      this.objectSetup();
      //random obstacle generator - gets sometimes stuck in while loop in generateObstacles()
      // this.generateObstacles();
      //random winning area generator 
      this.generateWinningArea();
    }

    updateInputs () {
      let sensorValues = this.params.getNormalisedActiveValues()
      // todo: this is a very messy fix for cases with less than 5 sensors
      let modifier = [];
      modifier[0] = sensorValues[0]   
      modifier[1] = sensorValues[0]   
      modifier[2] = sensorValues[0]   
      modifier[3] = sensorValues[0]   
      modifier[4] = sensorValues[0]
      for(let i = 0; i<sensorValues.length;i++) {
          modifier[i] = sensorValues[i]
      }
      //tilt of two axis only in one direction per axis
      if (modifier[1] >= this.inputThreshold) {
          board.angleX = modifier[1] * world.playerSensitivity;
          this.synth2.triggerAttack("D3");
      }
      else if (modifier[3] >= this.inputThreshold) {
          board.angleX = - modifier[3] * world.playerSensitivity;
          this.synth1.triggerAttack("A3");
      }
      else {
        this.synth2.triggerRelease();
        this.synth1.triggerRelease();
        board.angleX = 0;
      }
      if (modifier[0] >= this.inputThreshold) {
          board.angleY = - modifier[0] * world.playerSensitivity;
          this.synth4.triggerAttack("F3");
      }
      else if (modifier[4] >= this.inputThreshold) {
          board.angleY = modifier[4] * world.playerSensitivity;
          this.synth3.triggerAttack("G3");
      }
      else {
        board.angleY = 0;
        this.synth4.triggerRelease();
        this.synth3.triggerRelease();
      }
    }

    update () {
      this.updateInputs();
      this.calculateFriction();
      this.collisionDetection(obstacle1);
      this.collisionDetection(obstacle2);
      this.collisionDetection(obstacle3);
      this.collisionDetection(wallLeft);
      this.collisionDetection(wallRight);
      this.collisionDetection(wallFront);
      this.collisionDetection(wallBack);
      this.collisionDetection(winningArea);
      player.collision = false;
      player.accX = world.gravity * Math.sin(board.angleY);
      player.accY = world.gravity * Math.sin(board.angleX);
      player.speedX = player.speedX + player.accX;
      player.speedY = player.speedY + player.accY;
      player.posX = player.posX + player.speedX;
      player.posY = player.posY + player.speedY;
      if (this.gameState == "next") {
        player.speedX = 0;
        player.speedY = 0;
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
      if (this.gameState != "won"){
        this.update();
      }
      this.drawPlayer();
      this.drawBoard();
    }
}
export default TiltBoard