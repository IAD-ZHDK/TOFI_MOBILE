import P5 from 'p5'
import View from './View'
import tofi from './utils/tofiVisualiser'

// sandbox 

class Game02 extends View {
    constructor (p, Tone, Timer, params) {
        super(p, Tone, Timer, params)
        this.tofiTrainer = new tofi (p, 0.5, 0.5, p.width*0.8, p.height*0.8, this.params, this.Tone)
        this.totalSensors = this.params.getNoActive()
    }
    draw () {
        this.p.clear()
        // p.background(80, 120, 30)
        this.tofiTrainer.display();
    }
    windowResized() {
        this.tofiTrainer.resize(0.5, 0.5, this.p.width * 0.8, this.p.height * 0.8)
      //  let diameter = this.tofiTrainer.height*0.14
    }

}
export {Game02}