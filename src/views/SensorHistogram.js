import P5 from 'p5'
import View from './View'
import Sensor from './Sensor'


class SensorHistogram extends View {
  constructor (p, Tone, Timer, params) {
    super(p, Tone, Timer, params)
    this.histogram = new Array(8)
    // Loop to create 2D array
    for (let i = 0; i < this.histogram.length; i++) {
      this.histogram[i] = new Array(1)
    }
    this.p.colorMode(this.p.RGB)
    this.p.textSize(15)
  }
  draw () {
    this.p.background(50);
    let normalisedValues = this.params.getNormalisedValues();
    let spacing = this.p.windowHeight / normalisedValues.length
    this.p.translate((this.p.windowWidth / 2), (spacing / 2))
    for (let i = 0; i < normalisedValues.length; i++) {
      let active = this.params.getIsActive(i)
      this.p.push()
          let radius = normalisedValues[i]*spacing * 0.9
          radius = this.p.constrain(radius, 10, spacing * 0.9)
          this.p.translate(0,spacing * i)
        if (active) {
          this.drawHistogram (i, radius)
          if (this.params.atThreshold(i)) {
            this.p.fill(0)
          } else {
            this.p.fill(200)
          }
          this.p.ellipse(0, 0, radius, radius)
        } else {
          let radius = spacing * 0.2
          this.p.fill(100)
          this.p.noStroke()
          this.p.ellipse(0, 0, radius, radius)
        }
        //label
          this.p.fill(255)
          this.p.noStroke()
          this.p.translate(90, 0)
          this.p.text(this.params.getSensorValue(i), 0, 0)
          this.p.translate(0, this.p.textSize()+6)
          this.p.text(this.params.chanelNames[i], 0, 0)
        this.p.pop()
    }
  }
  drawHistogram (i, radius) {
    this.histogram[i].unshift(radius / 2)
    this.p.stroke(255)
    this.p.noFill()
    this.p.beginShape()
    for (let j = 0; j < this.histogram[i].length - 1; j++) {
      this.p.vertex(-j*2, this.histogram[i][j])
    }
    this.p.endShape()
    this.p.beginShape()
    for (let j = 0; j < this.histogram[i].length - 1; j++) {
      this.p.vertex(-j*2, -this.histogram[i][j])
    }
    this.p.endShape()
    if(this.histogram[i].length>120) {
      this.histogram[i].pop()
    }
  }
}
export default SensorHistogram
