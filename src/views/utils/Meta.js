import { Tone } from 'tone/build/esm/core/Tone';
import Ball from './Ball.js'
// metaball example based on work by Richard Bourne
// https://openprocessing.org/sketch/1229865

let ballCount = 11
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

void main() {
	vec2 coord = ((vPos+1.0) / 2.0) * dim;

	float amplitude = 0.0;
	for (int i = 0; i < ${ballCount}; i++) {
		amplitude += exp(-1.0/balls[i].z * (pow(coord.x - balls[i].x,2.0) + pow(coord.y - balls[i].y,2.0)));
	}
	amplitude = amplitude / 4.0;
	// if (amplitude>1.0) {
	//  amplitude = 1.0;
	// }
	// todo: compare performance of clamp functions to conditionals 
	amplitude = clamp(amplitude,0.0,1.0);
	float alpha = 1.0;
	
	if (amplitude<0.2) {
	  alpha = 0.0;
	}
	
  gl_FragColor = vec4(amplitude,0.3,1.0-amplitude, alpha);
}
`;


// define scales for the arpeggios
let scale1Notes1 = ["F2"];
let scale1Notes2 = ["C3", "D3", "F3", "G3", "A3"];
let scale1Notes3 = ["D4", "F4", "G4", "A4"];
let scale1Notes4 = ["A4", "C5", "D5", "F5"];

let scale2Notes1 = ["D2"];
let scale2Notes2 = ["D3", "D#3", "G3", "A3", "C3"];
let scale2Notes3 = ["D#4", "G4", "A4", "C4"];
let scale2Notes4 = ["C5", "G5", "A5", "D5"];


class Meta {

  constructor (p, width, height, params, Tone, envelopes) {
    this.p = p
    this.params = params
    this.balls = []
    this.width = width
    this.height = height
    this.smoothedInputs = [0, 0, 0, 0, 0];
    for (let i = 0; i < ballCount; i++) {
      this.balls.push(new Ball(p, Math.random()*this.width, p.random(0, height),Tone, envelopes))
    }
    this.density = 4 //p.displayDensity()
    this.pg = p.createGraphics(width, height, p.WEBGL)
    this.metaballsShader = this.pg.createShader(vertexShader, fragmentShader);
    this.soundSetup(Tone,envelopes);
    // sound paramaters
    this.i = 0;
    this.j = 0;
    this.t = 0;
    this.u = 0;
    this.o = 0;
  }

  update (Tone) {
    let sensorValues = this.params.getNormalisedActiveValues()
    //p.push()
    let centerW = this.width/2
    let centerH = this.height/2
    // p.translate(centerW, centerH)
    // todo: this is a very messy fix for cases with less than 5 sensors
    let modifier = [];
    modifier[0] = sensorValues[0]
    modifier[1] = sensorValues[0]
    modifier[2] = sensorValues[0]
    modifier[3] = sensorValues[0]
    modifier[4] = sensorValues[0]
    for(let i = 0; i<sensorValues.length;i++) {
        modifier[i] = sensorValues[i]
    }
    let averagePos = this.p.createVector(0, 0);
    for (let i = 0; i < this.balls.length; i++) {
      this.balls[i].addXamp((modifier[3]+modifier[4])*(this.width))
      this.balls[i].addYamp((modifier[2]+modifier[4])*(this.height))
      this.balls[i].addRadius(modifier[1])
      this.balls[i].addSpeed(modifier[0]*0.5)
      this.balls[i].update()
      averagePos.add(this.balls[i].x, this.balls[i].y)
    }
    averagePos.div(this.balls.length)
    averagePos.div(this.width,this.height)
    let ballsUniformArray = [];
    for (const ball of this.balls) {
      ballsUniformArray.push((ball.x+centerW))
      ballsUniformArray.push((ball.y+centerH))
      ballsUniformArray.push(ball.r*100)
    }
    this.metaballsShader.setUniform("dim",[this.width,this.height]);
    this.metaballsShader.setUniform(`balls`, ballsUniformArray)
    this.render()
    this.p.image(this.pg, 0,0)



    //// Sound Control Parameters
    for (let n = 0; n < this.smoothedInputs.length; n++){
      this.smoothInputs(modifier[n], n);
    }

    this.volFX.volume.value = -50 + this.smoothedInputs[3] * 52;
    this.reverb1.wet.value = 0.2 + this.p.constrain(this.smoothedInputs[3], 0, 0.6);

    this.volArp.volume.value = -50 + this.smoothedInputs[2] * 50;
    this.widener1.width.value = 0.8 * this.smoothedInputs[2]; 
    this.reverb2.wet.value = 0.1 + this.p.constrain(this.smoothedInputs[2], 0, 0.9);

    this.synth2.volume.value = -7 + this.smoothedInputs[1] * 8;
    this.filter.frequency.value = this.smoothedInputs[1] * 6000 + 200;
    this.pingpongDelay3.feedback.value = 0.3 + this.p.constrain(this.smoothedInputs[1], 0, 0.3);

    Tone.Transport.bpm.value = 50 + this.smoothedInputs[0] * 100;
    
  }

  smoothInputs (inputValue, inputNumber) {
    this.smoothedInputs[inputNumber] = this.smoothedInputs[inputNumber] * this.balls[0].ballInertia + inputValue * (1 - this.balls[0].ballInertia);
    this.p.constrain(this.smoothedInputs[inputNumber], 0, 1);
  }


  render () {
    this.pg.shader(this.metaballsShader); //Set active shader to metaballsShader
    this.pg.noStroke(); //Remove stroke around quad
    this.pg.quad(-1, -1, 1, -1, 1, 1, -1, 1); //Draw quad filling screen with currently active shader (metaballsShader)
  }

  minMax (num, min, max) {
    const MIN = min || 1
    const MAX = max || 20
    const parsed = parseInt(num)
    return Math.min(Math.max(parsed, MIN), MAX)
  }

  ////initialize sound objects
  soundSetup(Tone, envelopes) {
    ////Control Variables for sound objects
    //1
    let chorus1Speed = "16n";
    let chorus1DelayInterval = 4;
    let chorus1Depth = 0.05;
    let reverb1Decay = 4;
    let reverb1Wet = 0.2;
    let distortion1Wet = 0.1;
    let stereoWidth = 0;
    let filter1Cutoff = 300;

    //2
    let chorus2Speed = "16n";
    let chorus2DelayInterval = 4;
    let chorus2Depth = 0.05;
    let reverb2Decay = 5;
    let reverb2Wet = 0.7;

    //3
    let chorus3Speed = "16n";
    let chorus3DelayInterval = 4;
    let chorus3Depth = 0.05;
    let reverb3Decay = 4;
    let reverb3Wet = 0.7;
    let delay3Interval = "8n";
    let delay3Feedback = 0.3;
    let delay3Wet = 1;

    //4
    let chorus4Speed = "16n";
    let chorus4DelayInterval = 4;
    let chorus4Depth = 0.05;
    let reverb4Decay = 5;
    let reverb4Wet = 0.7;
    let delay4Interval = "2n";
    let delay4Feedback = 0.4;
    let delay4Wet = 1;

    //General
    let filterCutoff = 8000;
    let filterResonance = 0;
    let volumeDry = -8;
    let volumeArp = -100;
    let volumeFX = -180;
    let bpmValue = 50;


    ////initialize synths and FX's

    this.synth1 = new Tone.MonoSynth();
    this.synth2 = new Tone.MonoSynth();
    this.synth3 = new Tone.MonoSynth();
    this.synth4 = new Tone.MonoSynth();

    this.chorus1 = new Tone.Chorus(chorus1Speed, chorus1DelayInterval, chorus1Depth);
    this.chorus2 = new Tone.Chorus(chorus2Speed, chorus2DelayInterval, chorus2Depth);
    this.chorus3 = new Tone.Chorus(chorus3Speed, chorus3DelayInterval, chorus3Depth);
    this.chorus4 = new Tone.Chorus(chorus4Speed, chorus4DelayInterval, chorus4Depth);

    this.reverb1 = new Tone.Reverb(reverb1Decay);
    this.reverb2 = new Tone.Reverb(reverb2Decay);
    this.reverb3 = new Tone.Reverb(reverb3Decay);
    this.reverb4 = new Tone.Reverb(reverb4Decay);

    this.pingpongDelay3 = new Tone.PingPongDelay(delay3Interval, delay3Feedback);
    this.pingpongDelay4 = new Tone.PingPongDelay(delay4Interval, delay4Feedback);

    this.filter = new Tone.Filter(filterCutoff, "lowpass");
    this.filter1 = new Tone.Filter(filter1Cutoff, "lowpass");

    this.distortion1 = new Tone.Distortion(distortion1Wet);

    this.widener1 = new Tone.StereoWidener(stereoWidth);

    this.volDry = new Tone.Volume(volumeDry);
    this.volArp = new Tone.Volume(volumeArp);
    this.volFX = new Tone.Volume(volumeFX);


    ////set parameters for synths and FX's
    Tone.Transport.bpm.value = bpmValue;

    this.filter.Q.value = filterResonance;

    this.widener1.wet.value = 1;

    this.pingpongDelay3.wet.value = delay3Wet;
    this.pingpongDelay4.wet.value = delay4Wet;

    this.reverb1.wet.value = reverb1Wet;
    this.reverb2.wet.value = reverb2Wet;
    this.reverb3.wet.value = reverb3Wet;
    this.reverb4.wet.value = reverb4Wet;

    this.synth1.filterEnvelope.attack = 0.1;
    //this.synth1.filter.frequency = 1000;
    this.synth1.envelope.attack = 0.5;
    this.synth1.envelope.decay = 0.0;
    this.synth1.envelope.sustain = 1;
    this.synth1.envelope.attackCurve = "linear";
    this.synth1.envelope.release = 0.8;
    this.synth1.oscillator.type = "triangle";
    this.synth1.volume.value = -1.8;

    this.synth2.filterEnvelope.attack = 0.1;
    //this.synth2.filter.frequency = 400;
    this.synth2.envelope.attack = 1.6;
    this.synth2.envelope.decay = 0.2;
    this.synth2.envelope.sustain = 0.8;
    this.synth2.envelope.attackCurve = "linear";
    this.synth2.envelope.release = 2.8;
    this.synth2.oscillator.type = "sine";
    this.synth2.volume.value = -4;

    this.synth3.filterEnvelope.attack = 0.2;
    //this.synth3.filter.frequency = 400;
    this.synth3.envelope.attack = 0.5;
    this.synth3.envelope.decay = 0.0;
    this.synth3.envelope.sustain = 0;
    this.synth3.envelope.attackCurve = "linear";
    this.synth3.envelope.release = 1.2;
    this.synth3.oscillator.type = "sawtooth";
    this.synth3.volume.value = -1;

    this.synth4.filterEnvelope.attack = 0.2;
    //this.synth4.filter.frequency = 400;
    this.synth4.envelope.attack = 0.1;
    this.synth4.envelope.decay = 0.2;
    this.synth4.envelope.sustain = 0;
    this.synth4.envelope.attackCurve = "linear";
    this.synth4.envelope.release = 0.1;
    this.synth4.oscillator.type = "triangle";
    this.synth4.volume.value = -1;


    ////route signals
    this.synth1.chain(this.chorus1, this.distortion1, this.reverb1, this.widener1, this.filter1, this.volDry);

    this.synth2.chain(this.chorus2, this.reverb2, this.filter);

    this.synth3.chain(this.chorus3, this.reverb3, this.volArp);
    this.synth3.chain(this.pingpongDelay3, this.volFX);

    this.synth4.chain(this.chorus4, this.reverb4, this.volArp);
    this.synth4.chain(this.pingpongDelay4, this.volFX);

    this.filter.connect(this.volDry);

    this.volArp.connect(this.volDry);

    this.volDry.toDestination();

    this.volFX.toDestination();


    ////set arpeggios
    this.arp1 = new Tone.Pattern((time, note) => {
      this.synth1.triggerAttackRelease(note,"1n");

    }, ["F2"], "random");

    this.arp1.humanize = false;
    this.arp1.values = scale1Notes1;
    this.arp1.playbackRate = 0.25;

   this.arp2 = new Tone.Pattern((time, note) => {
        this.synth2.triggerAttackRelease(note,"2n");

    }, ["C3", "D3", "F3", "G3", "A3"], "random");

    this.arp2.humanize = false;
    this.arp2.values = scale1Notes2;
    this.arp2.playbackRate = 0.25;

    this.arp3 = new Tone.Pattern((time, note) => {
        this.synth3.triggerAttackRelease(note,"16n");

    }, ["D4", "F4", "G4", "A4"], "random");

    this.arp3.humanize = true;
    this.arp3.values = scale1Notes3;
    this.arp3.playbackRate = 2;

    this.arp4 = new Tone.Pattern((time, note) => {
        this.synth4.triggerAttackRelease(note,"1n");

    }, ["A4", "C5", "D5", "F5"], "random");  //upDown

    this.arp4.humanize = false;
    this.arp4.values = scale1Notes4;
    this.arp4.playbackRate = 8;


    ////start audio Objects

    this.chorus1.start();
    this.chorus2.start();
    this.chorus3.start();
    this.chorus4.start();

    this.arp1.start("0:0:0");
    this.arp2.start("0:0:0");
    this.arp3.start("0:0:0");
    this.arp4.start("0:0:0");

    Tone.start();
    Tone.Transport.start();
  }

  draw (p) {

  }
}
export default Meta


