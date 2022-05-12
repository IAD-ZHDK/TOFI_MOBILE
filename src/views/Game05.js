import P5 from 'p5'
import View from './View'
import TiltBoard from "./viewUtils/TiltBoard.js";
import TextBox from "./viewUtils/TextBox";
import { addBtn } from "./viewUtils/DomButton.js";
import { Player } from 'tone';
import { pushPage } from '..';


class Game05 extends View {
    constructor (p, Tone, Timer, params) {
        super(p, Tone, Timer, params);
        this.tiltboard = new TiltBoard(p, p.width, p.height, params, Tone, this.Timer.envelopes, this.colorPallet);
        this.messageNo = 0;
        this.messages = ['Press the sensors to tilt the board and move the ball',
                         'Reach the hole to progress to the next level']
        this.textBox = new TextBox(this.p,this.messages[this.messageNo], 0, - this.p.height*.4,p.width*0.4,p.height*0.5)
        this.messageNo++
        let font = this.p.loadFont('./css/fonts/inconsolata.otf');
        this.p.textFont(font);
        this.timer = this.p.millis() + 7000
      
        addBtn(function(){
            this.timer = this.p.millis() + 7000
            this.textBox.setText(this.messages[this.messageNo])
            params.enableLogingSave()
        }.bind(this),"Start")
        this.winningtimer = 0;
    }


    draw () {
        this.p.clear();
        // this.Tone.start();
     
        this.textBox.display(0, 0)
        this.p.translate(0,0,-100)
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
        if (this.tiltboard.gameState == "intro") {
            this.tiltboard.initializeGame();
            this.tiltboard.gameState = "maze";
        }
        else if (this.tiltboard.gameState == "maze") {
            this.tiltboard.draw();
        }
        else if (this.tiltboard.gameState == "won") {
            this.tiltboard.draw();
            this.textBox.setText("You Won!");
            this.winningtimer = this.p.millis() + 4000;
            this.tiltboard.gameState = "next";
        }
        else if (this.tiltboard.gameState == "lost") {
            //add loosing state
        }
        else if (this.tiltboard.gameState == "next") {
            this.tiltboard.draw();
            this.textBox.setText("You Won!");
            if (this.p.millis() > this.winningtimer) {
                this.tiltboard.gameState = "intro";
            }
        }
        else {
            this.tiltboard.gameState == "intro";
        }
    }
}
export {Game05}