import P5 from 'p5'
import View from './View'
import Meta from './utils/Meta.js'
import TextBox from "./utils/TextBox";
import { addBtn } from "./utils/DomButton.js";

class Game03 extends View {
    constructor (p, Tone, Timer, params) {
        super(p, Tone, Timer, params)
        this.meta = new Meta(p, p.width, p.height, params, Tone, this.Timer.envelopes)
        this.messageNo = 0;
        this.tone = Tone;
        this.messages = ['Please put your TOFI - TRAINER on',
                         'Forcefully press the different sensor areas on your TOFI trainer',
                         'Try to keep the blob in constant motion']
        this.textBox = new TextBox(this.p,this.messages[this.messageNo],this.p.width/2, this.p.height*.1,p.width*0.4,p.height*0.5)
        this.messageNo++
        addBtn(function(){
            this.timer = this.p.millis() + 7000
            this.textBox.setText(this.messages[this.messageNo])
            this.messageNo++
        }.bind(this),"I am ready!")
    }
    draw () {
        this.p.clear()
        // this.tofiTrainer.display()
        this.meta.update(this.tone)
        this.textBox.display(this.p.width/2, this.p.height*.2)
        if (this.timer < this.p.millis()) {
            if (this.messageNo < this.messages.length) {
                this.timer = this.p.millis() + 7000
                this.textBox.setText(this.messages[this.messageNo])
                this.messageNo++;
            } else {
                this.textBox.setText("")
            }
        }
    }
}
export {Game03}