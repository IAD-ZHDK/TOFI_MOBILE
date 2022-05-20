import P5 from 'p5'
import View from './View'
import Meta from './viewUtils/Meta.js'
import TextBox from "./viewUtils/TextBox";
import { addBtn } from "./viewUtils/DomButton.js";
import tofi from './viewUtils/tofiVisualiser'
import { createMachine } from './viewUtils/StateMachine.js'

class Game03 extends View {
    constructor (p, Tone, Timer, params) {
        super(p, Tone, Timer, params)
        this.statesMachineNew = this.stateMachine();
        this.meta = new Meta(p, p.width, p.height, params, Tone, this.Timer.envelopes)
        this.messageNo = 0;
        this.tone = Tone;
        this.messages = ['Forcefully press the different sensor areas on your TOFI trainer',
                         'Try to keep the blob in constant motion']
        this.textBox = new TextBox(this.p,this.messages[this.messageNo],this.p.width/2, this.p.height*.2,p.width*0.4,p.height*0.5)
        //this.messageNo++
        this.StartPos = this.p.createVector(-p.width*0.2, 0);
        this.PlayPosition = this.p.createVector(0, 0);
        this.Pos = this.StartPos.copy();
        this.timer = this.p.millis() + 5000
        
        this.tofiTrainer = new tofi(p,0.7, 0.5, p.width,p.height*0.6, this.params, this.Tone)
    }
    draw () {
        this.p.clear()
        if (this.statesMachineNew.value === 'intro') {
            this.p.image(this.meta.update(this.tone),this.Pos.x,this.Pos.y);
            this.tofiTrainer.hideSensors()
            this.tofiTrainer.display()
            if (this.timer < this.p.millis()) {
                if (this.messageNo < this.messages.length) {
                    this.timer = this.p.millis() + 5000
                    this.textBox.setText(this.messages[this.messageNo])
                    this.messageNo++;
                } else {
                    this.textBox.setText('Press start when you are ready')
                    let state = this.statesMachineNew.value
                    state = this.statesMachineNew.transition(state, 'next')
                }
            }
        } else if (this.statesMachineNew.value === 'startScreen') {
            this.p.image(this.meta.update(this.tone),this.Pos.x,this.Pos.y);
            this.tofiTrainer.hideSensors()
            this.tofiTrainer.display()
        } else if (this.statesMachineNew.value === 'play') {
            this.Pos.mult(0.95)
            let step = this.PlayPosition.copy();
            step.mult(0.05)
            this.Pos.add(step)
            this.p.image(this.meta.update(this.tone),this.Pos.x,this.Pos.y);
        }

        this.textBox.display(this.p.width/2, this.p.height*.1)

  
    }

    stateMachine() {
        let binding = this
        const FSM = createMachine({
            initialState: 'intro',
            intro: {
                actions: {
                    onEnter() {
                        console.log('intro: onEnter')
                    },
                    onExit() {
                        console.log('intro: onExit')
                    },
                },
                transitions: {
                    next: {
                        target: 'startScreen',
                        action() {
                            console.log('transitionig to startScreen')
                        },
                    },
                },
            },
            startScreen: {
                actions: {
                    onEnter() {
                        addBtn(function(){
                            this.textBox.setText("")
                            let state = this.statesMachineNew.value
                            state = this.statesMachineNew.transition(state, 'next')
                            this.params.enableLogingSave()
                        }.bind(binding),"Start")
                        console.log('startScreen: onEnter')
                    },
                    onExit() {
                        console.log('startScreen: onExit')
                    },
                },
                transitions: {
                    next: {
                        target: 'play',
                        action() {
                            console.log('transitionig to play')
                        },
                    },
                },
            },
            play: {
                actions: {
                    onEnter() {
                        console.log('play: onEnter')
                    },
                    onExit() {
                        console.log('play: onExit')
                    },
                },
                transitions: {
                    next: {
                        target: 'intro',
                        action() {
                            console.log('transitionig to intro')
                        },
                    },
                },
            },
        })
        return FSM
    }
}
export {Game03}