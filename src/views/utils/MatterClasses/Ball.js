/*
Usage:
// define ball radius via r attribute
let block = new Ball(world, { x: 300, y: 300, r: 30, color: 'magenta' }, { isStatic: true });
*/
import Matter from 'matter-js'
import Block from './Block'

class Ball extends Block {
  
  constructor(p, world, attrs, options) {
    super(p, world, attrs, options);
  }

  addBody() {
    this.body = Matter.Bodies.circle(this.attrs.x, this.attrs.y, this.attrs.r, this.options);
  }
}
export default Ball
