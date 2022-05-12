import P5 from 'p5'
//import 'p5/lib/addons/p5.sound'
//import * as Tone from 'tone'

class Note {
  constructor(P, Tone, midiNote, x, y, diameter, color, envelopes) {
    this.p = P
    this.midiNote = midiNote
    this.NoteFlag = false // playing note
    this.envelope = new Tone.AmplitudeEnvelope({
      attack: 0.1,
      decay: 0.2,
      sustain: 0.3,
      release: 0.4,
    }).toDestination()

    this.oscillator = new Tone.Oscillator({
      partials: [3, 2, 1],
      type: "custom",
      frequency: Tone.Midi(this.midiNote).toFrequency(),
      volume: -8,
    }).connect(this.envelope).start()

    envelopes.push(this.envelope)
    this.RGBColor = color
    this.freq = 261
    //this.oscillator.freq(this.freq)// set frequency
    //this.oscillator.start() // start oscillating
    this.diameter = diameter
    this.amp = 0 // simulate amplitude
    this.x = x
    this.y = y
  }

  display(value, x, y) {
    if (x >= 0) {
      this.x = x;
    }
    if (y >= 0) {
      this.y = y;
    }
    let offset = 0
    if (this.amp > 5) {
      this.amp *= 0.96
      let angle = this.p.millis() * (this.freq / 1000) * (this.p.PI * 2)
      offset = this.p.sin(this.p.radians(angle)) * this.amp * 0.5
    } else {
      this.amp = 5
    }
    /*
     if (this.NoteFlag) {
        this.p.fill(this.HSBColor, 255, this.amp)
      } else {
        this.p.fill(this.HSBColor, 255, 5)
      }
    */
    if (value >= 0) {
      // Player Mode
      this.p.fill(this.colorAlpha(this.RGBColor, 0.4 + (this.amp * 0.01)))
      this.p.stroke(this.RGBColor)
      this.p.ellipse(this.x, this.y, this.diameter + offset, this.diameter + offset)
      this.p.noFill()
      this.p.ellipse(this.x, this.y, value * this.diameter, value * this.diameter)
    } else {
      // Simon Mode
      this.p.fill(this.colorAlpha(this.RGBColor, 0.2 + (this.amp * 0.01)))
      this.p.stroke(this.RGBColor)
      this.p.ellipse(this.x, this.y, this.diameter + offset, this.diameter + offset)
    }
  }

  colorAlpha(aColor, alpha) {
    var c = this.p.color(aColor);
    return this.p.color('rgba(' + [this.p.red(c), this.p.green(c), this.p.blue(c), alpha].join(',') + ')');
  }

  checkMouseOver() {
    // mouse check
    let dist = this.p.dist(this.x, this.p.height / 2, this.p.mouseX, this.p.mouseY)
    if (dist <= this.diameter / 4) {
      return true
    } else {
      return false
    }
  }

  trigger() {
    if (this.NoteFlag === false) {
      this.NoteFlag = true
      this.envelope.triggerAttackRelease(1.0)
      // this.envelope.play()
      this.amp = 80
      return true
    }
  }

  release() {
    if (this.NoteFlag === true) {
      this.NoteFlag = false
      // this.envelope.triggerRelease()
    }
  }
}
export default Note
