import P5 from 'p5'
require('../index.js')
import View from './View'
import TextBox from './utils/TextBox'
import tofi from './utils/tofiVisualiser'
import * as EntryPoint from "../index"
import { createMachine } from './utils/StateMachine.js'


class SpeedTest extends View {

    constructor (p, Tone, Timer, params) {
        super(p, Tone, Timer, params)
        //this.statesMachine = Object.create(machine);
        this.statesMachineNew = this.stateMachine();
        this.totalSensors = this.params.getNoActive()
        this.currentSensor = 0
        this.textBox = new TextBox(this.p,'Please put your TOFI-TRAINER on',this.p.width/2, this.p.height*.1,p.width*0.4,p.height*0.5)
        this.counter = 0
        // speed
        this.speedTotal  = 0;
        this.totalTouches  = 10;
        this.remaningTouches  = this.totalTouches ;
        this.tofiTrainer = new tofi(p,0.5, 0.5, p.width,p.height*0.6, this.params, this.Tone)
        this.addBtn(function(){
            //this.statesMachine.dispatch('next')
            let state = this.statesMachineNew.value
            state = this.statesMachineNew.transition(state, 'next')
        }.bind(this),"Speed Test")
    }

    draw () {
        this.p.clear()
        if (this.statesMachineNew.value === 'intro') {
            this.intro()
        } else if (this.statesMachineNew.value === 'speed') {
            this.speed()
        } else if (this.statesMachineNew.value === 'sandBox') {
            this.sandBox()
        } else {
            this.feedBack()
        }
    }

    windowResized(){
        this.textBox.resize(this.p.width/2, this.p.height*.1,this.p.width*0.4,this.p.height*0.5);
        this.tofiTrainer.resize(0.5, 0.5, this.p.width, this.p.height * 0.6)
    }


    sandBox() {
        this.textBox.display()
        this.tofiTrainer.display()
    }
    intro() {
        this.p.fill(255);
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
            let threshold = 0.8
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

    addBtn(callback, label) {
        const containerElement = document.getElementById('p5-container')
        let div = document.createElement("div");
        div.style.cssText = 'position:absolute; top:90%; left:50%; transform:translate(-50%, -50%);'
        let btn = document.createElement("ons-button")
        btn.innerHTML = label
        btn.onclick = function () {
            containerElement.removeChild(div)
            callback()
        }.bind(this);
        div.appendChild(btn);
        containerElement.appendChild(div)
    }


    stateMachine() {
        let binding = this
        const FSM = createMachine({
            initialState: 'sandBox',
            sandBox: {
                actions: {
                    onEnter() {
                        console.log('sandBox: onEnter')
                    },
                    onExit() {
                        console.log('sandBox: onExit')
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
            intro: {
                actions: {
                    onEnter() {
                        binding.remaningTouches  = binding.totalTouches
                        binding.counter = binding.p.millis()
                        binding.textBox.setText('Move your tongue to the target indicated as fast as possible.')
                        binding.addBtn(function () {
                            let state = this.statesMachineNew.value
                            state = this.statesMachineNew.transition(state, 'next')
                        }.bind(binding), "start")
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
                            console.log('transition to sandBox')
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
                        binding.textBox.setText('your average speed was: '+rounded+' seconds')
                        binding.addBtn(function () {
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
                        binding.addBtn(function () {
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

