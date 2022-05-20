/*
Usage:
// define ball radius via r attribute
let block = new Ball(world, { x: 300, y: 300, r: 30, color: 'magenta' }, { isStatic: true });
*/
import Matter from 'matter-js'
import Block from './Block'

class Blob {
  
  constructor(p, world, x, y, r, color) {
    this.p = p;
    this.x = x; 
    this.y = y;
    this.r = r;
    this.color = color;
    this.balls = []
    this.noBalls = 80;
    this.angleStep = (Math.PI*2)/ this.noBalls;
    let distBetweenPoints = p.dist(0,this.r,Math.sin(this.angleStep )*this.r, Math.cos(this.angleStep )*this.r)
    let ballSize = distBetweenPoints/2.0;
    let Xoffset = Math.sin(0)*this.r
    let Yoffset = Math.cos(0)*this.r
    this.middleBall = new Block(p, world, {x: this.x, y:this.y, w:1, h:1, color: 'white'}, {isStatic: true});
    let firstBall = new Block(p, world, {x:this.x+Xoffset, y:this.y+Yoffset, w:ballSize, h:ballSize, color: 'red'}, {isStatic: false});
    this.balls.push(firstBall);

    for (let i = 1; i <this.noBalls; i++) {
      let Xoffset = Math.sin(i*this.angleStep)*this.r
      let Yoffset = Math.cos(i*this.angleStep)*this.r
      let ball = new Block(p, world, {x:this.x+Xoffset, y:this.y+Yoffset, w:ballSize, h:ballSize, color: 'white'}, {isStatic: false});
      this.balls.push(ball);
      ball.constrainTo(this.balls[i-1], { length: distBetweenPoints, stiffness: 0.1, damping: 0.5});
    }
    this.balls[this.balls.length-1].constrainTo(firstBall, { length: distBetweenPoints, stiffness: 0.1,damping: 0.5});
    for (let ball of this.balls) {
        this.middleBall.constrainTo(ball, { length: this.r, stiffness: 0.001});

    }
  }

  draw() {
 //for (let ball of this.balls) {
        // console.log(circle);
      // ball.draw();
      //  this.middleBall.draw();
       // this.middleBall.drawConstraints();
     //  }
     //  console.log(this.middleBall.body.position);
     this.drawVertices(this.balls)
  }

  drawVertices(vertices) {
    this.p.fill(this.color);
    this.p.beginShape();
    for (const vertice of vertices) {
      this.p.vertex(vertice.body.position.x, vertice.body.position.y);
    }
    this.p.endShape(this.p.CLOSE);
  }
  inflation() {
    // correct when blob collapses 

    for (let i = 1; i <this.noBalls; i++) {
        let Xoffset = Math.sin(i*this.angleStep)*this.r
       // let Yoffset = Math.cos(i*this.angleStep)*this.r
        if (Xoffset>0 && this.balls[i].attrs.x<0) { 
            this.balls[i].attrs.x = +10;
        } else if (Xoffset<0 && this.balls[i].attrs.x>0) { 
            this.balls[i].attrs.x = -10;
        }

    }

  }
  updateR(r) {
      this.r = r;
      for (let constraints of this.middleBall.constraints) {
        constraints.length = this.r;
      }
      let distBetweenPoints = this.p.dist(0,this.r,Math.sin(this.angleStep)*this.r, Math.cos(this.angleStep)*this.r)
      for (let ball of this.balls) {
            for (let constraints of ball.constraints) {
                constraints.length = distBetweenPoints;
            }
          }
          this.inflation();
      }
   
  }
export default Blob
