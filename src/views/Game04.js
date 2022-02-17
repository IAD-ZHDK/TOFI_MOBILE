import P5 from 'p5'
import View from './View'
import Wave from './utils/Wave.js'
import Tofi from './utils/tofiVisualiser'


class Game04 extends View {

    constructor (p, Tone, Timer, params) {
        super(p, Tone, Timer, params)
        this.totalSensors = this.params.getNoActive()
        this.tofiTrainer = new Tofi(this.p,.5, .5, p.width*0.5,p.height*0.8, this.params, this.Tone)
        //this.tofiTrainer.sensorLocations
        //todo: wait for tofitrainer promise to be filled before creating wave object
        this.wave = new Wave(.5, .5, this.p.width, this.p.height, p, this.tofiTrainer.sensorLocations, params)
    }

    draw () {
        this.p.clear()
        // p.background(80, 120, 30)
        this.tofiTrainer.display();
        let sensorValues = this.params.getNormalisedActiveValues()
        //let sensorLocations = this.tofiTrainer.sensorLocations
        let threshold  = 0.5
        for (let i = 0; i < this.totalSensors; i++) {
            if (sensorValues[i]> threshold) {
                // this.wave.Splash(this.tofiTrainer.sensorLocations[i].x, this.tofiTrainer.sensorLocations[i].y, sensorValues[i]*1000)
            }
        }
        this.wave.update()
    }
}
export {Game04}