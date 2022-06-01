import P5 from 'p5'
import View from './View'
import TiltBoard from "./viewUtils/TiltBoard.js";
import TextBox from "./viewUtils/TextBox";
import { addBtn } from "./viewUtils/DomButton.js";
import tofi from './viewUtils/tofiVisualiser'
//import { Player } from 'tone';
//import { pushPage } from '..';


class Game05 extends View {
    constructor(p, Tone, Timer, params) {
        super(p, Tone, Timer, params);
        this.initialSetup = true;
        this.tiltboard = new TiltBoard(p, p.width, p.height, params, Tone, this.Timer.envelopes, this.colorPallet);
        this.messageNo = 0;
        this.messages = ['Press the sensors to tilt the board and move the ball',
            'Reach the hole to progress to the next level']
        this.textBox = new TextBox(this.p, this.messages[this.messageNo], 0, - this.p.height * .4, p.width * 0.4, p.height * 0.5)
        this.messageNo++
        let font = this.p.loadFont('./css/fonts/inconsolata.otf');
        this.p.textFont(font);
        this.timer = this.p.millis() + 5000
        this.boardStartPos = this.p.createVector(-(p.width*0.25), 100, -300);
        this.boardPlayPosition = this.p.createVector(0, 0, -100);
        this.boardPos = this.boardStartPos.copy();
        this.tofiPos = this.p.createVector(.75, .55);
        this.winningtimer = 0;
        this.sensors = params.getSensors()
    }


    draw() {
        this.p.clear();
        // this.Tone.start();
        this.textBox.display(0, -this.p.height*0.4) 
        this.p.translate(this.boardPos.x, this.boardPos.y, this.boardPos.z)
        this.p.directionalLight(255, 0, 0, 0.25, 0.25, 0);
        if (this.tiltboard.gameState == "setup") {
            this.setup();
        } else if (this.tiltboard.gameState == "intro") {
           this.intro();
        } else if (this.tiltboard.gameState == "mazeAnim") {
            // animation 
            this.boardPos.mult(0.95)
            let step = this.boardPlayPosition.copy();
            step.mult(0.05)
            this.tofiPos.x += .02;
            this.pg.move(this.tofiPos.x,this.tofiPos.y)
            this.boardPos.add(step)
            // 
            this.tiltboard.draw();
            let difference = this.p.abs(this.boardPos.x-this.boardPlayPosition.x)
            if(difference <=0.01) {
                console.log("animation Over");
                this.close();
                this.tiltboard.gameState = "maze"
            }
        }else if (this.tiltboard.gameState == "maze") {
            this.tiltboard.draw();
        } else if (this.tiltboard.gameState == "won") {
            this.tiltboard.draw();
            this.textBox.setText("You Won!");
            this.winningtimer = this.p.millis() + 4000;
            this.tiltboard.gameState = "next";
        } else if (this.tiltboard.gameState == "lost") {
            //add loosing state
        } else if (this.tiltboard.gameState == "next") {
            this.tiltboard.draw();
            this.textBox.setText("You Won!");
            if (this.p.millis() > this.winningtimer) {
                this.tiltboard.gameState = "setup";
            }
        } else {
            this.tiltboard.gameState == "setup";
        }
    }

    setup() {
        this.tiltboard.initializeGame();
        const containerElement = document.getElementById('p5-container2')
        this.pg = new P5(function( sketch ) {
            sketch.setup = function() {
              sketch.createCanvas(this.p.width, this.p.height);
           // this.boardStartPos
              sketch.tofiTrainer = new tofi(sketch, this.tofiPos.x, this.tofiPos.y, sketch.width * 0.5, sketch.height * 0.5, this.params, this.Tone)
            }.bind(this)
            sketch.draw = function() {
            sketch.clear();
            if (this.sensors.back.active == false) {
            sketch.tofiTrainer.display()
            } else {
            sketch.tofiTrainer.display(0,1,3,4) 
            }
            }.bind(this)
            sketch.move = function(x,y){
                sketch.tofiTrainer.move(x,y)
            }
          }.bind(this), containerElement);
        this.tiltboard.gameState = "intro";
    }

    intro() {
        if (this.timer < this.p.millis()) {
            if (this.messageNo < this.messages.length) {
                this.timer = this.p.millis() + 5000
                this.textBox.setText(this.messages[this.messageNo])
                this.messageNo++;
            } else if (this.initialSetup == true){
                this.initialSetup = false;
                this.textBox.setText("Press start when you are ready")
                addBtn(function () {
                    this.timer = this.p.millis() + 5000
                    this.textBox.setText(this.messages[this.messageNo])
                    this.params.enableLogingSave()
                    this.tiltboard.gameState = "mazeAnim";
                }.bind(this), "Start")
            }
        }
        this.tiltboard.draw();
    }

    close () {
        try {
          this.pg.remove()
        } catch (error) {
          console.log(error);
          // expected output: ReferenceError: nonExistentFunction is not defined
          // Note - error messages will vary depending on browser
        }
      }
}
export { Game05 }