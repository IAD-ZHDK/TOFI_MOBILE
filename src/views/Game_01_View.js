// import 'p5/lib/addons/p5.sound'
import Note from './Note'
import View from './View'
import Tofi from './utils/tofiVisualiser'
import TextBox from './utils/TextBox'
import { createMachine } from './StateMachine.js'
import * as EntryPoint from "../index";

// a simple version of the "Simon" audio game using the Tofi Trainer

//todo: notes sound shorter when player controlling than when simon is
class Game_01_View extends View {
    constructor (p, Tone, Timer, params) {
        super(p, Tone, Timer, params)
        this.Notes = []
        this.interval = 700
        this.sequenceStartFlag = false
        this.SimonSequence = []
        this.SimonSequenceLength = 4
        this.SimonSequenceIndex = 0
        this.midiNotes = [60, 62, 64, 67, 69, 72, 74] // C D E G A C
        this.colorPallet = [196, 330, 36, 159, 312, 60, 250]
        this.totalSensors = this.params.getNoActive()
        this.visualWidth = this.p.windowWidth * 0.7
        this.isConnected = false
        this.sequenceCorrectSofar = true
        // states
        this.statesMachineNew = this.stateMachine();
        //this.GamePlayer = 0
        //this.GameSimon = 1
        //this.state = this.GamePlayer
        this.p.colorMode(this.p.HSB)
        this.p.blendMode(this.p.SCREEN)
        // p.textFont(myFont)
        this.textBox = new TextBox(this.p,'Please put your TOFI-TRAINER on',0,0,p.width/2,p.height/2)
        //  create new tofi visualization just for getting sensor locations.
        this.tofiTrainer = new Tofi(p,.5, .5, p.width*0.5,p.height*0.8, this.params, this.Tone)
        this.setupSoundObjects(this.tofiTrainer.sensorLocations)
        this.newSimonSequence()
        this.addBtn(function(){
            //this.statesMachine.dispatch('next')
            let state = this.statesMachineNew.value
            state = this.statesMachineNew.transition(state, 'next')
        }.bind(this),"Play Simon")
    }

    draw () {
        this.p.clear()
        this.p.background(249, 60, 20, 10)
        this.textBox.display(this.p.width/2, this.p.height*.2)
        if (this.statesMachineNew.value === 'intro') {
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
            //console.log('this.newSimonSequence')
        }
        if (this.sequenceStartFlag === false) {
            this.sequenceStartFlag = true
            //console.log("SimonSequenceIndex"+this.SimonSequenceIndex)
            this.Timer.event = setTimeout(function () { this.playSequence() }.bind(this), this.interval)
        }
        for (let i = 0; i < this.totalSensors; i++) {
            this.Notes[i].display(1)
        }
    }
    playSequence () {
        if (this.SimonSequenceIndex < this.SimonSequenceLength) {
            this.releaseAllNotes()
            this.Notes[this.SimonSequence[this.SimonSequenceIndex]].trigger()
            //console.log(this.SimonSequence[this.SimonSequenceIndex])
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
        let threshold  = 0.5
        for (let i = 0; i < this.totalSensors; i++) {
            this.Notes[i].display(0)
            //let radius = p.map(sensorValues[i], 0, 16384, 10, spacing * 0.3)
            if (sensorValues[i]> threshold) {
                this.Notes[i].trigger()
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
        let threshold  = 0.5
        for (let i = 0; i < this.totalSensors; i++) {
            this.Notes[i].display(0)
            //let radius = p.map(sensorValues[i], 0, 16384, 10, spacing * 0.3)
            if (sensorValues[i]> threshold) {
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

    addBtn(callback, label) {
        const containerElement = document.getElementById('p5-container')
        let div = document.createElement("div");
        div.style.cssText = 'position:absolute; top:85%; left:50%; transform:translate(-50%, -50%);'
        let btn = document.createElement("ons-button")
        btn.innerHTML = label
        btn.onclick = function () {
            containerElement.removeChild(div)
            callback()
        }.bind(this);
        div.appendChild(btn);
        containerElement.appendChild(div)
    }

    startGame () {
        //todo: this.state = this.GameSimon
        let state = this.statesMachineNew.value
        this.statesMachineNew.transition(state, 'next')
    }

    setupSoundObjects (sensorLocations) {
       // let initialOffsetX = (this.p.windowWidth - this.visualWidth) / 2
        let diameter = this.visualWidth / 5 // slightly overlaping
       // let spacing = this.visualWidth / this.totalSensors
       // initialOffsetX += spacing / 2
        for (let i = 0; i < this.totalSensors; i++) {
            let x =  sensorLocations[i].x * this.p.width
            let y =  (sensorLocations[i].y - 0.05) * this.p.height
           // this.Notes[i] = new Note(this.p, this.Tone, this.midiNotes[i], (spacing * i) + initialOffsetX, this.p.windowHeight / 2, diameter, this.colorPallet[i], this.Timer.envelopes)
            this.Notes[i] = new Note(this.p, this.Tone, this.midiNotes[i], x, y, diameter, this.colorPallet[i], this.Timer.envelopes)
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
                        binding.addBtn(function(){
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
                        binding.textBox.setText('oops!')
                        console.log('repeat:' + binding.SimonSequence)
                        binding.addBtn(function(){
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
export default Game_01_View
