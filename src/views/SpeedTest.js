import P5 from 'p5'
import View from './View'
import TextBox from './viewUtils/TextBox'
import tofi from './viewUtils/tofiVisualiser'
import { createMachine } from './viewUtils/StateMachine.js'
import { addBtn } from "./viewUtils/DomButton.js";

class SpeedTest extends View {

    constructor (p, Tone, Timer, params) {
        super(p, Tone, Timer, params)
        this.textBox = new TextBox(this.p,'Press start when you are ready',this.p.width/2, this.p.height*.1,p.width*0.4,p.height*0.5)
        //this.statesMachine = Object.create(machine);
        this.statesMachineNew = this.stateMachine();
        this.totalSensors = this.params.getNoActive()
        this.currentSensor = 0
        this.counter = 0
        // speed
        this.speedTotal  = 0;
        this.totalTouches  = 20;
        this.remaningTouches  = this.totalTouches ;
        this.tofiTrainer = new tofi(p,0.5, 0.5, p.width,p.height*0.6, this.params, this.Tone)
    }

    draw () {
        this.p.clear()
        if (this.statesMachineNew.value === 'intro') {
            this.intro()
        } else if (this.statesMachineNew.value === 'speed') {
            this.speed()
        } else {
            this.feedBack()
        }
    }

    windowResized(){
        this.textBox.resize(this.p.width/2, this.p.height*.1,this.p.width*0.4,this.p.height*0.5);
        this.tofiTrainer.resize(0.5, 0.5, this.p.width, this.p.height * 0.6)
    }

    intro() {
    
        this.textBox.display()
        this.tofiTrainer.display()
    }

    speed() {
        this.p.fill(255);
        this.textBox.display()
        this.tofiTrainer.display(this.currentSensor)
        if (this.remaningTouches<=0) {
            let state = this.statesMachineNew.value
            state = this.statesMachineNew.transition(state, 'next')
        } else {
            let threshold = 0.85
            let currentSensorValue = this.params.getNormalisedActive(this.currentSensor)
            if (currentSensorValue > threshold) {
                if (this.remaningTouches === this.totalTouches) {
                    //set timer from first press
                    this.counter = this.p.millis()
                    console.log('timer start')
                } else if (this.remaningTouches < this.totalTouches) {
                    // keep a running count of time to reach points.
                    this.speedTotal += this.p.millis() - this.counter
                    this.counter = this.p.millis()
                }
                let newRandom = 0
                // avoid the same sensor twice
                do {
                    newRandom = this.p.floor(this.p.random(this.totalSensors))
                } while (this.currentSensor === newRandom)
                this.currentSensor = newRandom
                this.remaningTouches--
                this.textBox.setText('Remaining targets: ' + this.remaningTouches)
            }
        }
    }

    feedBack() {
        this.p.fill(255);
        this.textBox.display()
        this.tofiTrainer.display()
    }

    dexterity() {
        this.p.fill(255);
        this.textBox.display()
        this.tofiTrainer.display(this.currentSensor)
    }


    stateMachine() {
        let binding = this
        const FSM = createMachine({
            initialState: 'intro',
        
            intro: {
                actions: {
                    onEnter() {
                        binding.remaningTouches  = binding.totalTouches
                        binding.counter = binding.p.millis()
                        binding.textBox.setText('Press start when you are ready')
                        addBtn(function () {
                            let state = this.statesMachineNew.value
                            state = this.statesMachineNew.transition(state, 'next')
                        }.bind(binding), "Start")
                        console.log('intro: onEnter')
                    },
                    onExit() {
                        console.log('intro: onExit')
                    },
                },
                transitions: {
                    next: {
                        target: 'speed',
                        action() {
                            console.log('transitionig to Dexterity')
                        },
                    },
                },
            },
            speed: {
                actions: {
                    onEnter() {
                        binding.textBox.setText('The timer will begin when you press the first target')
                        console.log('Speed: onEnter')
                    },
                    onExit() {
                        console.log('Speed: onExit')
                    },
                },
                transitions: {
                    next: {
                        target: 'feedback',
                        action() {
                            console.log('transition to feedback')
                        },
                    },
                },
            },
            feedback: {
                actions: {
                    onEnter() {
                        binding.tofiTrainer.display(0,1,2,3,4,5)
                        let average = binding.speedTotal / binding.totalTouches  // millis
                        average = average/1000 // seconds
                        let rounded = Math.round((average + Number.EPSILON) * 100) / 100;
                        binding.params.logSpeedResult(rounded);
                        binding.params.enableLogingSave();
                        binding.textBox.setText('your average speed was: '+rounded+' seconds')
                        addBtn(function () {
                            let state = this.statesMachineNew.value
                            state = this.statesMachineNew.transition(state, 'next')
                        }.bind(binding), "repeat speed test")
                        console.log('feedback: onEnter')
                    },
                    onExit() {
                        console.log('feedback: onExit')
                    },
                },
                transitions: {
                    next: {
                        target: 'intro',
                        action() {
                            console.log('transition to intro')
                        },
                    },
                },
            },
            dexterity: {
                actions: {
                    onEnter() {
                        binding.textBox.setText('Move your tongue to the areas indicated')
                        addBtn(function () {
                            let state = this.statesMachineNew.value
                            state = this.statesMachineNew.transition(state, 'next')
                        }.bind(binding), "next")
                        console.log('Dexterity: onEnter')
                    },
                    onExit() {
                        console.log('Dexterity: onExit')
                    },
                },
                transitions: {
                    next: {
                        target: 'speed',
                        action() {
                            console.log('transitionig to Speed')
                        },
                    },
                },
            },

            strength: {
                actions: {
                    onEnter() {
                    },
                    onExit() {
                    },
                },
                transitions: {
                    next: {
                        target: 'endurance',
                        action() {
                        },
                    },
                },
            },
            endurance: {
                actions: {
                    onEnter() {
                    },
                    onExit() {
                    },
                },
                transitions: {
                    next: {
                        target: 'fatigue',
                        action() {
                        },
                    },
                },
            },
            fatigue: {
                actions: {
                    onEnter() {
                    },
                    onExit() {
                        console.log('Fatigue: onExit')
                    },
                },
                transitions: {
                    next: {
                        target: 'end',
                        action() {
                            console.log('transition to end')
                        },
                    },
                },
            },
            recovery: {
                actions: {
                    onEnter() {
                    },
                    onExit() {
                        console.log('recovery: onExit')
                    },
                },
                transitions: {
                    next: {
                        target: 'end',
                        action() {
                            console.log('transition to end')
                        },
                    },
                },
            },
            end: {
                actions: {
                    onEnter() {
                        console.log('end: onEnter')
                    },
                    onExit() {
                        console.log('end: onExit')
                    },
                },
            },
        })
        return FSM
    }
}
export {SpeedTest}

