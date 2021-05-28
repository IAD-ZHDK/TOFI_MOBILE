import P5 from 'p5'
require('../index.js')
import View from './View'
import TextBox from './TextBox'
import tofi from './tofiVisualiser'
import * as EntryPoint from "../index";

// state machine based on https://kentcdodds.com/blog/implementing-a-simple-state-machine-library-in-javascript
function createMachine(stateMachineDefinition) {
    const FSM = {
        value: stateMachineDefinition.initialState,
        transition(currentState, event) {
            const currentStateDefinition = stateMachineDefinition[currentState]
            const destinationTransition = currentStateDefinition.transitions[event]
            if (!destinationTransition) {
                return
            }
            const destinationState = destinationTransition.target
            const destinationStateDefinition =
                stateMachineDefinition[destinationState]

            destinationTransition.action()
            currentStateDefinition.actions.onExit()
            destinationStateDefinition.actions.onEnter()

            FSM.value = destinationState

            return FSM.value
        },
    }
    return FSM
}


class CalibrationView extends View {

    constructor (p, Tone, Timer, params) {
        super(p, Tone, Timer, params)
        //this.statesMachine = Object.create(machine);
        this.statesMachineNew = this.stateMachine();
        this.totalSensors = this.params.getNoActive()
        this.currentSensor = 0
        this.maxValues= []
        this.minValues = []
        for (let i = 0; i<this.totalSensors;i++) {
            this.maxValues[i] = 0
            this.minValues[i] = 0xFFFF
        }
        this.textBox = new TextBox(this.p,'Please put your TOFI-TRAINER on',0,0,p.width/2,p.height/2)
        this.counterTextBox = new TextBox(this.p,'0',0,0,p.width/4,p.height/4)
        this.counterTextBox.settextSize(40)
        this.counter = 10
        this.tofiTrainer = new tofi(p,p.width/2, p.height*.6, p.width*0.5,p.height*0.6, this.params, this.Tone)
        this.addBtn(function(){
            //this.statesMachine.dispatch('next')
            let state = this.statesMachineNew.value
            state = this.statesMachineNew.transition(state, 'next')
            this.textBox.setText('Press the following sensor with your maximum strength until the counter is finished')
        }.bind(this),"I am ready!")
    }

    draw () {
        this.p.clear()
        if (this.statesMachineNew.value === 'intro') {
            this.intro()
        } else if (this.statesMachineNew.value === 'calibrating') {
            this.calibrating()
        } else if (this.statesMachineNew.value === 'nextCalibration') {
            this.nextCalibration()
        } if (this.statesMachineNew.value === 'finished') {
            this.finished()
        }
    }

    intro() {
        this.p.fill(255);
        this.textBox.display(this.p.width/2, this.p.height*.2)
        this.tofiTrainer.display()
    }
    calibrating() {
        this.textBox.display(this.p.width/2, this.p.height*.2)
        let countdown = this.counter-Math.floor(this.p.millis()/1000)
            if (countdown>=0) {
                this.counterTextBox.setText(countdown)
                this.counterTextBox.display(this.p.width / 2, this.p.height * .35)
            } else {
                let state = this.statesMachineNew.value
                state = this.statesMachineNew.transition(state, 'next')
               // this.statesMachine.dispatch('next')
            }
        let currentSensorValue = this.params.getActive(this.currentSensor)
        for (let i = 0; i<this.totalSensors;i++) {
            let sensorValue = this.params.getActive(i)
            if (sensorValue < this.minValues[i]) {
                this.minValues[i] = sensorValue
            }
        }
        if (currentSensorValue > this.maxValues[this.currentSensor]) {
            this.maxValues[this.currentSensor] = currentSensorValue
        }
        this.tofiTrainer.display(this.currentSensor)
    }

    nextCalibration() {
        this.textBox.display(this.p.width/2, this.p.height*.2)
        this.tofiTrainer.display(this.currentSensor)
    }
    
    finished() {
        this.textBox.display(this.p.width/2, this.p.height*.2)
        this.tofiTrainer.display(this.currentSensor)
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
        this.state = this.GameSimon
        this.demoMode = false
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
                        target: 'calibrating',
                        action() {
                            console.log('transitionig to calibrating')
                        },
                    },
                },
            },
            calibrating: {
                actions: {
                    onEnter() {
                        binding.textBox.setText('Press the following sensor with your maximum strength until the counter is finished')
                        console.log('calibrating: onEnter')
                    },
                    onExit() {
                        console.log('calibrating: onExit')
                    },
                },
                transitions: {
                    next: {
                        target: 'nextCalibration',
                        action() {
                            console.log('transition to nextCalibration')
                        },
                    },
                    last: {
                        target: 'finished',
                        action() {
                            console.log('transition to finished')
                        },
                    },
                },
            },
            nextCalibration: {
                actions: {
                    onEnter() {
                        console.log('nextCalibration: onEnter')
                        binding.textBox.setText('Get ready to press with your maximum strength on the next sensor')
                        if (binding.currentSensor < binding.totalSensors-1) {
                            binding.currentSensor++
                            binding.addBtn(function () {
                                let state = this.statesMachineNew.value
                                state = this.statesMachineNew.transition(state, 'next')
                                this.counter = Math.floor(this.p.millis() / 1000) + 1
                            }.bind(binding), "I'M READY")
                        } else {
                            //this.transition(this.value, 'last')
                            // todo: there must be a better way to internally transistion between states
                            let state = binding.statesMachineNew.value
                            state = binding.statesMachineNew.transition(state, 'last')
                        }
                    },
                    onExit() {
                        console.log('nextCalibration: onExit')
                    },
                },
                transitions: {
                    next: {
                        target: 'calibrating',
                        action() {
                            console.log('transition to calibrating')
                        },
                    },
                    last: {
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
                        binding.textBox.setText('Callibration complete!')
                        for (let i = 0; i<binding.totalSensors;i++) {
                            if (binding.minValues[i]<binding.maxValues[i]) {
                                binding.params.setMin(i, binding.minValues[i])
                                binding.params.setMax(i, binding.maxValues[i])
                            }
                        }
                        binding.params.save()
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
export default CalibrationView

