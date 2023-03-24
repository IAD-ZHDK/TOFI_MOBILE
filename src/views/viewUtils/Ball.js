class Ball {
  constructor (p, x, y, Tone, envelopes) {
    this.p = p
    this.x = x
    this.y = y
    this.Tone = Tone
    let angle = p.random(0, 2 * p.PI)
    this.xspeed = p.random(2, 5) * Math.cos(angle)
    this.yspeed = p.random(2, 5) * Math.sin(angle)
    this.radMin = 5000
    this.r = this.radMin*9
    this.Xangle = p.random(p.PI)
    this.Yangle = p.random(p.PI)
    this.speed = 0.003
    this.Xamp = p.random(120)
    this.Yamp = p.random(120)
    this.dx = 0
    this.dy = 0
    this.smoothingFactor = 0.995;
  }

  update (p) {
    this.Xangle += this.speed
    this.Yangle += this.speed
    this.x = this.p.sin(this.Xangle) * this.Xamp
    this.y = this.p.cos(this.Yangle) * this.Yamp
    this.move(this.x / this.p.width,  this.y/ this.p.height)
    this.r = Math.max(this.r, this.radMin);
  }
  addXamp(Xamp) {
    this.Xamp *= this.smoothingFactor
    this.Xamp += (Xamp * (1-this.smoothingFactor))
  }
  addYamp(Yamp) {
    this.Yamp *= this.smoothingFactor
    this.Yamp += (Yamp *(1-this.smoothingFactor))
  }
  addSpeed(speed) {
    this.speed *= this.smoothingFactor
    this.speed += (speed * (1-this.smoothingFactor))
  }
  addRadius(r) {
    // smooth size 
    this.r  *= this.smoothingFactor
    this.r  += (r * (1-this.smoothingFactor))
  }
  draw (p) {
    p.noFill()
    p.stroke(0)
    p.strokeWeight(4)
    p.ellipse(50,50,50,50)
  }

  move(x, y) {
    x = this.p.constrain(x, 0, 1)
    y = this.p.constrain(y, 0, 1);
  }
  
}
export default Ball
