//import { Tone } from 'tone/build/esm/core/Tone';
import Tofi from './tofiVisualiser'
import Matter from 'matter-js'
import Blob from "./MatterClasses/Blob.js";
// based on matter p5js examples from 
//  


class Meta {

  constructor(p, width, height, params, Tone, envelopes, colorPallet) {
    this.p = p
    this.blobs = [];
    this.params = params
    this.colorPallet = colorPallet;
    this.width = width
    this.height = height

    this.tofiTrainer = new Tofi(p, .5, .60, this.width * 0.8, this.height * 0.8, this.params, this.Tone)
    this.tofiTrainer.hideSensors()
    this.tofiTrainer.opacity = 30;

    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    Matter.Runner.run(this.engine);

    this.engine.gravity.y = 0;
    this.totalSensors = this.params.getNoActive()
    for (let i = 0; i < this.totalSensors; i++) {
      let x = (this.tofiTrainer.sensorLocations[i].x * this.tofiTrainer.width) + this.tofiTrainer.centerX
      let y = (this.tofiTrainer.sensorLocations[i].y * this.tofiTrainer.height) + this.tofiTrainer.centerY
      let blob = new Blob(this.p, this.world, x,y, 30, this.colorPallet[i])
      this.blobs.push(blob);
    }
  }

  update(Tone) {
    let sensorValues = this.params.getNormalisedActiveValues()
    for (let i = 0; i < this.totalSensors; i++) {
      //let radius = p.map(sensorValues[i], 0, 16384, 10, spacing * 0.3)
      if (sensorValues[i] > 0.9) {
        this.blobs[i].updateR(this.blobs[i].r+= 1);
      } else {
         //always go back to 30
       let dif = 30 - this.blobs[i].r
       this.blobs[i].updateR(this.blobs[i].r += dif * 0.01);
      }
    }
    this.tofiTrainer.showOutline()
    this.draw() 
  }


  draw() {
    //sort by size
    var len =  this.blobs.length;
    var indices = new Array(len);
    var array = this.blobs;
    for (var i = 0; i < len; ++i) {
      indices[i] = i;
    }
    indices.sort(function (a, b) { return array[a].r < array[b].r ? -1 : array[a].r > array[b].r ? 1 : 0; });
    for (let i = 0; i < this.totalSensors; i++) {
      this.blobs[indices[i]].draw();
     }
  }
}
export default Meta