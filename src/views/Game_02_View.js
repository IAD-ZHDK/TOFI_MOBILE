import P5 from 'p5'
import View from './View'
import tofi from './tofiVisualiser'


class Game_02_View extends View {
    constructor (p, Tone, Timer, params) {
        super(p, Tone, Timer, params)
        p.colorMode(p.HSB)
        p.blendMode(p.SCREEN)
        this.tofiTrainer = new tofi (p,p.width/2, p.height/2, p.width*0.5, this.params, this.Tone)
    }

    draw () {
        this.p.clear()
        // p.background(80, 120, 30)
        this.tofiTrainer.display();
    }
}
export default Game_02_View