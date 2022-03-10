import P5 from 'p5'
require('../index.js')
import View from './View'
import TextBox from './utils/TextBox'
import tofi from './utils/tofiVisualiser'
import * as EntryPoint from "../index"
import { createMachine } from './utils/StateMachine.js'
//import Game02 from "./Game02";
import {map, constrain, moveingWeightedAverageFloat} from './utils/MathUtils'

const testDuration = 6;

class Calibration extends View {
    constructor(p, Tone, Timer, params) {
        super(p, Tone, Timer, params)
        //this.statesMachine = Object.create(machine);
        this.machine = this.stateMachine();
        this.totalSensors = this.params.getNoActive()
        this.currentSensor = 0
        this.maxValues = []
        this.minValues = []
        this.mockNormalised = []
        for (let i = 0; i < this.totalSensors; i++) {
            this.maxValues[i] = 0
            this.minValues[i] = 0xFFFF
            this.mockNormalised[i] = 0.1
        }
        console.log("mockNormalised"+this.mockNormalised);
        this.textBox = new TextBox(this.p, 'Please put your TOFI-TRAINER on. During the callibration, press on each sensor as hard as you can with your tongue ', 0, 0, p.width / 2, p.height / 2)
        this.counterTextBox = new TextBox(this.p, '0', 0, 0, p.width / 4, p.height / 4)
        this.counterTextBox.settextSize(40)
        this.counter = 10
        this.tofiTrainer = new tofi(p, 0.5, 0.6, p.width * 0.8, p.height * 0.8, this.params, this.Tone)
        this.addBtn(function () {
            //this.statesMachine.dispatch('next')
            let state = this.machine.value
            state = this.machine.transition(state, 'next')
            this.counter = Math.floor(this.p.millis() / 1000) + testDuration
            this.textBox.setText('Press on each sensor as hard as you can!')
        }.bind(this), "I'M READY")
        
    }

    draw() {
        this.p.clear()
        if (this.machine.value === 'intro') {
            this.tofiTrainer.hideSensors()
            this.intro()
        } else if (this.machine.value === 'measuring') {
            this.measuring()
        } else if (this.machine.value === 'finished') {
            this.finished()
        }
    }

    intro() {
        this.p.fill(255);
        this.textBox.display(this.p.width / 2, this.p.height * .1)
        this.tofiTrainer.display()
    }

    measuring() {
        this.textBox.display(this.p.width / 2, this.p.height * .1)
    //  this.tofiTrainer.showSensors()
        // look for variation in low and high values in all sensors 
        for (let i = 0; i < this.totalSensors; i++) {
            let sensorValue = this.params.getActive(i)
            if (sensorValue < this.minValues[i]) {
                this.minValues[i] = sensorValue 
            } 
            if (sensorValue > this.maxValues[i]) {
                this.maxValues[i] = sensorValue 
            } 
            
        }
        // look only for varian peaks in current sensor only
        /*
        if (currentSensorValue > this.maxValues[this.currentSensor]) {
            this.maxValues[this.currentSensor] = currentSensorValue
        }
        */
        this.tofiTrainer.setMockValues(this.normalisedSensorValues())
        this.tofiTrainer.display()
    }

    normalisedSensorValues() {
        // calculate the normalised values given input from user 
        for (let i = 0; i < this.totalSensors; i++) {
            let buffer = this.maxValues[i] - this.minValues[i]
            if (buffer>50) {
            let sensorValue = this.params.getActive(i)
            let min = this.minValues[i] + (buffer * 0.10)
            let max = this.maxValues[i] + (buffer * 0.15)
            let normalised = constrain(sensorValue, min, max)
            normalised = map(normalised, min, max, 0.0, 1.0)
           // this.mockNormalised[i] = normalised
            // console.log(normalised);
            this.mockNormalised[i] = moveingWeightedAverageFloat(normalised,  this.mockNormalised[i], 0.7)
            } else {
                this.mockNormalised[i] = 0.01
            }
        }
       
        return this.mockNormalised;
    } 



    finished() {
        this.textBox.display(this.p.width / 2, this.p.height * .1)
        //this.tofiTrainer.showSensors()
        this.tofiTrainer.setMockValues() 
        this.tofiTrainer.display()
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

    calibrateValues() {
        for (let i = 0; i < this.totalSensors; i++) {
            let buffer = Math.abs(this.maxValues[i] - this.minValues[i])
            // sub 10% to min values
            this.minValues[i] += (buffer * 0.10)
            // add 15% to max
            this.maxValues[i] -= (buffer * 0.15)
            if (this.minValues[i] < this.maxValues[i]) {
                this.params.setMin(i, this.minValues[i])
                this.params.setMax(i, this.maxValues[i])
            }
        }
        this.params.save()
    }
    windowResized() {
        this.tofiTrainer.resize(0.5, 0.6, this.p.width * 0.8, this.p.height * 0.8);
    }

    stateMachine() {
        let binding = this
        const FSM = createMachine({
            initialState: 'intro',
            intro: {
                actions: {
                    onEnter() {
                        binding.tofiTrainer.hideSensors()
                        console.log('intro: onEnter')
                    },
                    onExit() {
                        console.log('intro: onExit')
                    },
                },
                transitions: {
                    next: {
                        target: 'measuring',
                        action() {
                            console.log('transition to measuring')
                        },
                    },
                },
            },
            measuring: {
                actions: {
                    onEnter() {
                        binding.tofiTrainer.showSensors()
                        binding.textBox.setText('Press as hard as you can!')
                        binding.addBtn(function () {
                            let state = this.machine.value
                            state = this.machine.transition(state, 'next')
                        }.bind(binding), "Finished")
                        console.log('measuring: onEnter')
                    },
                    onExit() {
                        console.log('measuring: onExit')
                    },
                },
                transitions: {
                    next: {
                        target: 'finished',
                        action() {
                            console.log('transition to finished')
                        },
                    },
                },
            },
            finished: {
                actions: {
                    onEnter() {
                        console.log('finished: onEnter')
                        let state = binding.machine.value
                        console.log(state)
                        binding.textBox.setText('Callibration complete!')
                        binding.calibrateValues()
                        binding.addBtn(function () {
                            this.p.remove()
                            EntryPoint.backButton()
                        }.bind(binding), "Return to menu")
                    },
                    onExit() {
                        console.log('finished: onExit')
                    },
                },
                transitions: {
                    next: {
                        target: 'finished',
                        action() {
                            console.log('error, allredy finished')
                        },
                    },
                },
            },
        })
        return FSM
    }
}
export { Calibration }

