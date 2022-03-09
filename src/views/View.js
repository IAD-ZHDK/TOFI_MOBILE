
class View {
  constructor (p, Tone, Timer, params) {
    this.p = p
    this.params = params
    this.Tone = Tone
    this.Timer = Timer // timeout object for game timing
    this.randomID = p.random()
    this.colorPallet = [ p.color('#71C7AA'),  p.color('#CFBF5F'),  p.color('#42B2DF'),  p.color('#7B61FF'),  p.color('#B83992'),  p.color('#CFBF5F'), p.color('#CFBF5F')]
  }
  draw () {
  }
  windowResized(){
  }
}
export default View
