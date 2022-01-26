class Ball {
  constructor (p, x, y, Tone, envelopes) {
    this.p = p
    this.x = x
    this.y = y
    this.Tone = Tone
    let angle = p.random(0, 2 * p.PI)
    this.xspeed = p.random(2, 5) * Math.cos(angle)
    this.yspeed = p.random(2, 5) * Math.sin(angle)
    this.r = p.random(0, 1)
    this.r = 0.3
    this.rad = this.r*30
    this.Xangle = p.random(p.PI)
    this.Yangle = p.random(p.PI)
    this.speed = 0.003
    this.Xamp = p.random(120)
    this.Yamp = p.random(120)
    this.dx = 0
    this.dy = 0
    this.ballInertia = 0.995;
    this.notes1 = ["F2"];
    this.notes2 = ["C3", "D3", "F3", "G3", "A3"];
    this.notes3 = ["D4", "F4", "G4", "A4"];
    this.notes4 = ["A4", "C5", "D5", "F5"];
  }

  update (p) {
    this.Xangle += this.speed
    this.Yangle += this.speed
    this.x = this.p.sin(this.Xangle) * this.Xamp
    this.y = this.p.cos(this.Yangle) * this.Yamp
    // this.addXamp(0.1)
    // this.addYamp(0.1)
    this.move(this.x / this.p.width,  this.y/ this.p.height)
  }
  addXamp(Xamp) {
    this.Xamp *= this.ballInertia
    this.Xamp += (Xamp * (1-this.ballInertia))
  }
  addYamp(Yamp) {
    this.Yamp *= this.ballInertia
    this.Yamp += (Yamp *(1-this.ballInertia))
  }
  addSpeed(speed) {
    this.speed *= this.ballInertia
    this.speed += (speed * (1-this.ballInertia))
  }
  addRadius(r) {
    this.rad *= this.ballInertia
    this.rad += (r * (1-this.ballInertia))
    this.r = 30 + (this.rad * 400)
  }
  draw (p) {
    p.noFill()
    p.stroke(0)
    p.strokeWeight(4)
    p.ellipse(this.x, this.y, this.r * 2, this.r * 2)
  }

  soundSetup(Tone, envelopes) {
    /*
    // SYNTH
    // let note = this.notes[Math.floor(Math.random()* this.notes.length)];
    let note = this.notes[0]
    this.synth = new Tone.Oscillator({
      partials: [3, 2, 1],
      type: "custom",
      frequency: Tone.Midi(note).toFrequency(),
      volume: -40,
    }).toDestination().start();

    this.FX1 = new Tone.Panner(1).toDestination();

    // AutoFilter - a filter modulation effect
    this.FX2 = new Tone.Chorus({
          frequency : 20 ,
          delayTime : 4.3,
          depth : 5 ,
          spread : 180
        }
    ).toDestination().start();
    */
                  /*
                  // Tremolo - an amplitude modulation effect
                  this.FX3 = new Tone.PitchShift(0.1).toDestination();
                  this.osc = new Tone.Oscillator({
                    volume: -30,
                    type: "sine2",
                    frequency: "E2"
                  })

                  */
                  // this.osc.connect(this.tremolo)
                  //this.synth.connect(this.FX1)

                  // this.synth.connect(this.FX3)
                  //this.synth.triggerAttack(note);
    /*
    this.synth.connect(this.FX2)
    this.synth.connect(this.FX1)
    envelopes.push(this.synth)
    */
  }
  move(x, y) {
    x = this.p.constrain(x, 0, 1)
    y = this.p.constrain(y, 0, 1)
    // use the x and y values to set the note and vibrato
    //const note = this.notes[Math.round(y * (this.notes.length - 1))];
    //this.synth.frequency.value =  this.Tone.Midi(note).toFrequency()
    //this.FX1.pan.rampTo(1+(x*-2), 0.01);
  }
  
}
export default Ball
