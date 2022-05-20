//import { Tone } from 'tone/build/esm/core/Tone';
import Ball from './Ball.js'
import Tofi from './tofiVisualiser'
//import Delaunay from './delaunay.js'
// metaball example based on work by Richard Bourne
// https://openprocessing.org/sketch/1229865

let ballCount = 5
// online shader editor http://editor.thebookofshaders.com/


let vertexShader = `
attribute vec3 aPosition;
varying vec2 vPos;
void main() {
  vPos = vec2(aPosition.x,aPosition.y);
	gl_Position = vec4(aPosition,1.0);
}
`;

let fragmentShader = `
precision lowp float; // set low float precision. lowp, mediump, highp
uniform vec2 dim;
uniform vec3 balls[${ballCount}];
varying vec2 vPos;

vec3 color1 = vec3(0.0, 0.9, 0.00);
vec3 color2 = vec3(0.9, 0.9, 0.058);
vec3 color3 = vec3(0.9, 0.176, 0.9);
vec3 color4 = vec3(0.0, 0.9, 0.9);
vec3 color5 = vec3(0.1, 0.7, 0.9);

vec3 colorFinder(int index) {
  if (index == 0) {
    return color1;
  } else if (index == 1) {
    return color2;
  }else if (index == 2) {
    return color3;
  }else if (index == 3) {
    return color4;
  }
  return color5;
}

void main() {
	vec2 coord = ((vPos+1.0) / 2.0) * dim;
	vec3 newColor = vec3(1.0, 1.0, 1.0);
	float amplitude = 0.0;
  float colorsTotal = 0.0;
	for (int i = 0; i < ${ballCount}; i++) {
		amplitude += exp(-1.0/balls[i].z * (pow(coord.x - balls[i].x,2.0) + pow(coord.y - balls[i].y,2.0)));
    vec2 vectLength = balls[i].xy-coord;
    float dist = length(vectLength);
    float factor = (balls[i].z/dist)*0.01;
    factor = clamp(factor,0.0,0.9);
    //newColor += colorFinder(i)*factor;
    newColor = mix(newColor, colorFinder(i), factor);
	}


	amplitude = clamp(amplitude,0.0,1.0);
	float alpha = amplitude;
	
	if (amplitude<0.6) {
	  alpha = 0.0;
	}
  //newColor = newColor*amplitude;
	
  gl_FragColor = vec4(newColor.x,newColor.y,newColor.z, alpha);
}
`;




// define scales for the arpeggios

class Meta {

  constructor(p, width, height, params, Tone, envelopes) {
    this.p = p
    this.pts = [];
    this.params = params
    this.balls = []
    this.width = width
    this.height = height
    this.smoothedInputs = [0, 0, 0, 0, 0];
    this.tofiTrainer = new Tofi(p, .5, .60, this.width * 0.8, this.height * 0.8, this.params, this.Tone)
    this.tofiTrainer.hideSensors()
    this.tofiTrainer.opacity = 30;
    this.totalSensors = this.params.getNoActive()
    for (let i = 0; i < this.totalSensors; i++) {
      let x = (this.tofiTrainer.sensorLocations[i].x * this.tofiTrainer.width) + this.tofiTrainer.centerX
      let y = (this.tofiTrainer.sensorLocations[i].y * this.tofiTrainer.height) + this.tofiTrainer.centerY
      var newBall = {}
      newBall.x = x;
      newBall.y = y;
      newBall.r = 0.5;
      this.balls.push(newBall)
    }

    this.pg = p.createGraphics(width, height, p.WEBGL)
    this.metaballsShader = this.pg.createShader(vertexShader, fragmentShader);
  }


  update(Tone) {

    let sensorValues = this.params.getNormalisedActiveValues()
    for (let i = 0; i < this.totalSensors; i++) {
      //let radius = p.map(sensorValues[i], 0, 16384, 10, spacing * 0.3)
      if (sensorValues[i] > 0.9) {
        this.balls[i].r += 0.2;
      } else {
        // always go back to 0.5
        let dif = 0.5 - this.balls[i].r 
        this.balls[i].r += dif * 0.1
      }
      // this.p.text(sensorValues[sensorIndex], this.Notes[i].x, this.p.height - 50)
    }

    //p.push()
    let centerW = this.width / 2
    let centerH = this.height / 2

    let ballsUniformArray = [];
    for (const ball of this.balls) {
      ballsUniformArray.push((ball.x))
      ballsUniformArray.push(this.height-(ball.y))
      ballsUniformArray.push(ball.r*10000)
    }
    this.tofiTrainer.showOutline()
    this.metaballsShader.setUniform("dim", [this.width, this.height]);
    this.metaballsShader.setUniform(`balls`, ballsUniformArray)

    this.render()
    this.p.image(this.pg, 0, 0)
    this.tofiTrainer.showOutline()
      
  }

  smoothInputs(inputValue, inputNumber) {
    this.smoothedInputs[inputNumber] = this.smoothedInputs[inputNumber] * this.balls[0].ballInertia + inputValue * (1 - this.balls[0].ballInertia);
    this.p.constrain(this.smoothedInputs[inputNumber], 0, 1);
  }


  render() {
    this.pg.shader(this.metaballsShader); //Set active shader to metaballsShader
    this.pg.noStroke(); //Remove stroke around quad
    this.pg.quad(-1, -1, 1, -1, 1, 1, -1, 1); //Draw quad filling screen with currently active shader (metaballsShader)
  }


  ////initialize sound objects

  draw(p) {

  }
}
export default Meta
