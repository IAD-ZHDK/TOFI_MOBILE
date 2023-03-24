
import Note from './viewUtils/Note'
import View from './View'
import Tofi from './viewUtils/tofiVisualiser'
import TextBox from './viewUtils/TextBox'
import { createMachine } from './viewUtils/StateMachine.js'
import { addBtn } from "./viewUtils/DomButton.js";
import * as EntryPoint from "../index";

// a simple version of the "Simon" audio game using the Tofi Trainer

//todo: notes sound shorter when player controlling than when simon is
class Game01 extends View {
    constructor (p, Tone, Timer, params) {
        super(p, Tone, Timer, params)
        this.Notes = []
        this.interval = 700
        this.sequenceStartFlag = false
        this.SimonSequence = []
        this.startCheck = [] // for checking that each sensor is pressed atleast once at start.
        this.SimonSequenceLength = 4
        this.SimonSequenceIndex = 0
        this.midiNotes = [60, 62, 64, 67, 69, 72, 74] // C D E G A C
        this.totalSensors = this.params.getNoActive()
        this.isConnected = false
        this.sequenceCorrectSofar = true
        this.statesMachineNew = this.stateMachine();
        this.textBox = new TextBox(this.p,'To warm up, press each sensor firmly atleast once.',0,0,p.width/2,p.height/2)
        this.tofiTrainer = new Tofi(p,.5, .60, p.width*0.8, p.height*0.8, this.params, this.Tone)
        this.tofiTrainer.hideSensors()
        this.tofiTrainer.opacity = 30;
        this.setupSoundObjects(this.tofiTrainer.sensorLocations)
        this.newSimonSequence()
     
        this.threshold  = 0.90 // important, this is the mimum power required to set off note 
    }

    draw () {
        this.p.clear()
        this.textBox.display(this.p.width/2, this.p.height*.1)  
        this.tofiTrainer.showOutline()
        if (this.statesMachineNew.value === 'intro') {
            this.drawDemo()
            for(let i = 0; i<this.startCheck.length;i++) {
                if (!this.startCheck[i]) {
                    break;
                } 
                if (i == this.startCheck.length-1) {
                    // all sensors pressed once 
                    let state = this.statesMachineNew.value
                    state = this.statesMachineNew.transition(state, 'next')
                }
            }
        } else if (this.statesMachineNew.value === 'demo') {
            this.drawDemo()
        } else if (this.statesMachineNew.value === 'player') {
            this.drawGamePlayer()
        } else if (this.statesMachineNew.value === 'simon') {
            this.drawGameSimon()
        } if (this.statesMachineNew.value === 'won') {
            this.drawDemo()
        } if (this.statesMachineNew.value === 'lost') {
            this.drawDemo()
        }
    }

    newSimonSequence () {
        this.SimonSequence = []
        for (let i = 0; i < this.SimonSequenceLength; i++) {
            this.SimonSequence.push(this.p.floor(this.p.random(this.totalSensors)))
        }
    }

    drawGameSimon () {
        if (this.SimonSequence.length === 0) {
            this.newSimonSequence()
        }
        if (this.sequenceStartFlag === false) {
            this.sequenceStartFlag = true
            this.Timer.event = setTimeout(function () { this.playSequence() }.bind(this), this.interval)
        }
        for (let i = 0; i < this.totalSensors; i++) {
            this.Notes[i].display()
        }
    }
    playSequence () {
        if (this.SimonSequenceIndex < this.SimonSequenceLength) {
            this.releaseAllNotes()
            this.Notes[this.SimonSequence[this.SimonSequenceIndex]].trigger()
            this.SimonSequenceIndex++
            this.Timer.event = setTimeout(function () { this.playSequence() }.bind(this), this.interval)
        } else {
            // sequence finished
            this.sequenceStartFlag = false
            let state = this.statesMachineNew.value
            this.statesMachineNew.transition(state, 'next')
        }
    }

    drawDemo () {
        let sensorValues = this.params.getNormalisedActiveValues()
        for (let i = 0; i < this.totalSensors; i++) {
            let x =  (this.tofiTrainer.sensorLocations[i].x * this.tofiTrainer.width) + this.tofiTrainer.centerX
            let y =  (this.tofiTrainer.sensorLocations[i].y * this.tofiTrainer.height) + this.tofiTrainer.centerY
            this.Notes[i].diameter = this.tofiTrainer.width*0.14;
            this.Notes[i].display(sensorValues[i],x,y)
            //let radius = p.map(sensorValues[i], 0, 16384, 10, spacing * 0.3)
            if (sensorValues[i]> this.threshold ) {
                this.Notes[i].trigger()
                this.startCheck[i] = true; 
                //console.log(i)
            } else {
                this.Notes[i].release()
            }
            this.p.stroke(255)
            // this.p.text(sensorValues[sensorIndex], this.Notes[i].x, this.p.height - 50)
        }
    }
    drawGamePlayer () {
        let sensorValues = this.params.getNormalisedActiveValues()
        for (let i = 0; i < this.totalSensors; i++) {
            this.Notes[i].display(sensorValues[i])
            //let radius = p.map(sensorValues[i], 0, 16384, 10, spacing * 0.3)
            if (sensorValues[i] > this.threshold ) {
                if (this.Notes[i].trigger()) {
                        //console.log(i)
                        this.checkSequence(i)
                }
            } else {
                this.Notes[i].release()
            }
            this.p.stroke(255)
        }
    }
    checkSequence (i) {
        if (this.SimonSequence.length > 0) {
                // checking last note
                if (i === this.SimonSequence[this.SimonSequenceIndex]) {
                    //console.log('correct_' + this.SimonSequenceIndex + ' of' + this.SimonSequence.length)
                } else {
                    //console.log( i +'incorrect' + this.SimonSequenceIndex + "index:" + this.SimonSequence)
                    // repeat
                    this.sequenceCorrectSofar = false
                    // this.Timer.event = setTimeout(function () { this.sequenceLost() }.bind(this), 1000)
                    this.sequenceLost()
                }
            this.SimonSequenceIndex++
            if (this.SimonSequenceIndex >= this.SimonSequenceLength)  {
                // sequence won
                if (this.sequenceCorrectSofar === true) {
                    //console.log('sequence won')
                    let state = this.statesMachineNew.value
                    this.statesMachineNew.transition(state, 'won')
                }
            }
        } else {
            //console.log('no sequence')
        }
    }

    releaseAllNotes () {
        for (let i = 0; i < this.totalSensors; i++) {
            this.Notes[i].release()
        }
    }


    sequenceLost () {
        for (let i = 0; i < this.totalSensors; i++) {
                this.Notes[i].trigger()
        }
        let state = this.statesMachineNew.value
        this.statesMachineNew.transition(state, 'lost')
    }

    startGame () {
        //todo: this.state = this.GameSimon
        let state = this.statesMachineNew.value
        this.statesMachineNew.transition(state, 'next')
    }

    setupSoundObjects (sensorLocations) {
       // let initialOffsetX = (this.p.windowWidth - this.visualWidth) / 2
        let diameter = this.tofiTrainer.width*0.14;
       // let spacing = this.visualWidth / this.totalSensors
       // initialOffsetX += spacing / 2
        for (let i = 0; i < this.totalSensors; i++) {
            let x =  (sensorLocations[i].x * this.tofiTrainer.width) + this.tofiTrainer.centerX
            let y =  (sensorLocations[i].y * this.tofiTrainer.height) + this.tofiTrainer.centerY
           // this.Notes[i] = new Note(this.p, this.Tone, this.midiNotes[i], (spacing * i) + initialOffsetX, this.p.windowHeight / 2, diameter, this.colorPallet[i], this.Timer.envelopes)
            this.Notes[i] = new Note(this.p, this.Tone, this.midiNotes[i], x, y, diameter, this.colorPallet[i], this.Timer.envelopes)
            this.startCheck[i] = false;
        }
    }

    windowResized() {
        this.tofiTrainer.resize(0.5, 0.6, this.p.width * 0.8, this.p.height * 0.8)
        let diameter = this.tofiTrainer.height*0.14
        let sensorLocations = this.tofiTrainer.sensorLocations
        for (let i = 0; i < this.totalSensors; i++) {
            let X =  (sensorLocations[i].x * this.tofiTrainer.width) + this.tofiTrainer.centerX
            let Y =  (sensorLocations[i].y * this.tofiTrainer.height) + this.tofiTrainer.centerY
           // this.Notes[i] = new Note(this.p, this.Tone, this.midiNotes[i], (spacing * i) + initialOffsetX, this.p.windowHeight / 2, diameter, this.colorPallet[i], this.Timer.envelopes)
            this.Notes[i].x = X
            this.Notes[i].y = Y
            this.Notes[i].diameter = diameter
        }
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
                        target: 'demo',
                        action() {
                            console.log('transitionig to demo')
                        },
                    },
                },
            },
            demo: {
                actions: {
                    onEnter() {
                        addBtn(function(){
                            let state = this.statesMachineNew.value
                            state = this.statesMachineNew.transition(state, 'next')
                            this.params.enableLogingSave()
                        }.bind(binding),"Start")
                        binding.textBox.setText("Great, you can press start when you're ready to play.")
                        console.log('demo: onEnter')
                    },
                    onExit() {
                        console.log('demo: onExit')
                    },
                },
                transitions: {
                    next: {
                        target: 'simon',
                        action() {
                            console.log('transitionig to Simon')
                        },
                    },
                },
            },
            simon: {
                actions: {
                    onEnter() {
                        binding.SimonSequenceIndex = 0
                        binding.textBox.setText('Listen to the melody')
                        console.log('simon: onEnter')
                    },
                    onExit() {
                        console.log('simon: onExit')
                    },
                },
                transitions: {
                    next: {
                        target: 'player',
                        action() {
                            console.log('transition to player')
                        },
                    }
                },
            },
            player: {
                actions: {
                    onEnter() {
                        binding.SimonSequenceIndex = 0
                        binding.sequenceCorrectSofar = true
                        console.log('player: onEnter')
                        binding.textBox.setText('Repeat the melody you just heard')
                    },
                    onExit() {
                        console.log('player: onExit')
                    },
                },
                transitions: {
                    won: {
                        target: 'won',
                        action() {
                            console.log('transition to won')
                        },
                    },
                    lost: {
                        target: 'lost',
                        action() {
                            console.log('transition to lost')
                        },
                    },
                },
            },
            won: {
                actions: {
                    onEnter() {
                        console.log('won: onEnter')
                        binding.textBox.setText('Well done!')
                        binding.newSimonSequence()
                        addBtn(function(){
                            //this.statesMachine.dispatch('next')
                            let state = this.statesMachineNew.value
                            state = this.statesMachineNew.transition(state, 'next')
                        }.bind(binding),"Next Round")
                    },
                    onExit() {
                        console.log('finished: onExit')
                    },
                },
                transitions: {
                    next: {
                        target: 'simon',
                        action() {
                            console.log('next level')
                        },
                    },
                },
            },
            lost: {
                actions: {
                    onEnter() {
                        console.log('lost: onEnter')
                        binding.textBox.setText('oops! Practice a bit before trying again')
                        console.log('repeat:' + binding.SimonSequence)
                        addBtn(function(){
                            //this.statesMachine.dispatch('next')
                            let state = this.statesMachineNew.value
                            state = this.statesMachineNew.transition(state, 'next')
                        }.bind(binding),"Try Again")
                    },
                    onExit() {
                        console.log('finished: onExit')
                    },
                },
                transitions: {
                    next: {
                        target: 'simon',
                        action() {
                            console.log('repeat round')
                        },
                    },
                },
            },
        })
        return FSM
    }
}
export {Game01}
