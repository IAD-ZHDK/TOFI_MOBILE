
// inspiration: https://www.shadertoy.com/view/Xsd3DB
// https://thebookofshaders.com/03/
// https://codea.io/talk/discussion/6764/super-ripple-ripple-shader-tiler-update-set-multiple-ripple-points-for-multitouch
// https://www.shadertoy.com/view/3t2SRV
 import {vshader1 as vshader}  from './shaders.js';
 import {fshader2 as fshader } from './shaders.js';


class Wave {
  constructor (x,y, width, height, p, sensorLocations, params) {
    this.p = p
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.params = params
    this.img = this.p.loadImage('./img/noise.png',  img => {this.img.resize(this.width, this.height)})
    // controls how fast the waves spread. It can take values between 0 and 0.5, with larger values making the waves spread out faster.
   // this.nonShaderSetup()
    this.pg = this.p.createGraphics(this.width, this.height, this.p.WEBGL)
    this.waveShader = this.pg.createShader(vshader, fshader)

    this.points = []
    let i = 0
    for (const sensor of sensorLocations) {
      i++
      this.points.push(this.p.createVector(sensor.x, 1.0-sensor.y,0.01))
    }
  }



  update () {
    let sensorValues = this.params.getNormalisedActiveValues()
    for(let i = 0; i<sensorValues.length;i++) {
      if (this.points[i].z < sensorValues[i]) {
        this.points[i].z += 0.08
      }
      if (this.points[i].z - 0.01 > 0){
       this.points[i].z -= 0.01
      }
    }
    // this.p.image(this.img, 0,0)
    this.render()
  }

  minMax (num, min, max) {
    const MIN = min || 1
    const MAX = max || 20
    const parsed = parseInt(num)
    return Math.min(Math.max(parsed, MIN), MAX)
  }

  draw () {
  }

  render () {


    let UniformArray = [];
    for (const points of this.points) {
      UniformArray.push(points.x)
      UniformArray.push(points.y)
      UniformArray.push(points.z)
    }

    this.waveShader.setUniform("u_points",UniformArray);
    this.waveShader.setUniform("u_tex0Resolution",[this.img.width,this.img.height]);
    this.waveShader.setUniform("u_resolution",[this.img.width,this.img.height]);
    this.waveShader.setUniform(`u_tex0`, this.img)
    this.waveShader.setUniform(`u_time`, this.p.frameCount*0.01)
    this.pg.shader(this.waveShader); //Set active shader
    this.pg.noStroke(); //Remove stroke around quad
    this.pg.quad(-1, -1, 1, -1, 1, 1, -1, 1); //Draw quad filling screen with currently active shader (waveShader)
    this.p.image(this.pg, 0,0)
  }

}
export default Wave
