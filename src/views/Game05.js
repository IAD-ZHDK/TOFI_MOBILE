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
        this.tiltboard = new TiltBoard(p, p.width, p.height, params, Tone, this.Timer.envelopes, this.colorPallet);
        this.messageNo = 0;
        this.messages = ['Press the sensors to tilt the board and move the ball',
            'Reach the hole to progress to the next level']
        this.textBox = new TextBox(this.p, this.messages[this.messageNo], 0, - this.p.height * .4, p.width * 0.4, p.height * 0.5)
        this.messageNo++
        let font = this.p.loadFont('./css/fonts/inconsolata.otf');
        this.p.textFont(font);
        this.timer = this.p.millis() + 7000
        this.boardStartPos = this.p.createVector(0, 0, -700);
        this.boardPlayPosition = this.p.createVector(0, 0, -100);
        this.boardPos = this.boardStartPos.copy();

        addBtn(function () {
            this.timer = this.p.millis() + 7000
            this.textBox.setText(this.messages[this.messageNo])
            params.enableLogingSave()
            this.tiltboard.gameState = "maze";
        }.bind(this), "Start")
        this.winningtimer = 0;

/*
        const containerElement = document.getElementById('p5-container2')
        
       
        this.pg = new P5(function( sketch ) {
            sketch.setup = function() {
              sketch.createCanvas(600, 600);
              sketch.tofiTrainer = new tofi(sketch, 0.5, 0.5, sketch.width * 0.5, sketch.height * 0.5, params, Tone)
            }
            sketch.draw = function() {
            sketch.clear();
            sketch.tofiTrainer.hideSensors()
            sketch.tofiTrainer.display()
              //for canvas 1
            //  sketch.rotate(sketch.frameCount * 0.01);
            sketch.rotate(sketch.frameCount * 0.01);
            sketch.rect(-26, -26, 52, 52);
            }
          }, containerElement);

        // this.tofiTrainer = new tofi(this.pg, 0.8, 0.5,  this.pg.width * 0.5,  this.pg.height * 0.5, params, Tone)
        // this.tofiTrainer.display()
        */
    }


    draw() {
        this.p.clear();
        // this.Tone.start();
        this.textBox.display(0, -this.p.height*0.4) 
        this.p.translate(this.boardPos.x, this.boardPos.y, this.boardPos.z)
        if (this.timer < this.p.millis()) {
            if (this.messageNo < this.messages.length) {
                this.timer = this.p.millis() + 7000
                this.textBox.setText(this.messages[this.messageNo])
                this.messageNo++;
            } else {
                this.textBox.setText("")
            }
        }
        this.p.directionalLight(255, 0, 0, 0.25, 0.25, 0);
        if (this.tiltboard.gameState == "setup") {
            this.tiltboard.initializeGame();
            this.tiltboard.gameState = "intro";
        } else if (this.tiltboard.gameState == "intro") {
            this.tiltboard.draw();
        } else if (this.tiltboard.gameState == "maze") {
            this.boardPos.mult(0.95)
            let step = this.boardPlayPosition.copy();
            step.mult(0.05)
            this.boardPos.add(step)
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


}
export { Game05 }