import {getColorPallet} from "../utils/colorPalette.js";

class View {
  constructor (p, Tone, Timer, params) {
    this.p = p
    this.params = params
    this.Tone = Tone
    this.Timer = Timer // timeout object for game timing
    this.randomID = p.random()
    this.colorPallet = getColorPallet();
  }
  draw () {
  }
  windowResized(){
  }
}
export default View
