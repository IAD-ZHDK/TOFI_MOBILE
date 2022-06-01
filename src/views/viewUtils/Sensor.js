//import P5 from 'p5'
//import TextBox from './TextBox'
import {getColorPallet} from "../../utils/colorPalette.js";


class Sensor {
    constructor (p, radius, Tone) {
        this.p = p
        this.radius = radius;
        this.osc = null
        this.Tone = Tone
        this.hiden = false
        this.calibrating = false
        this.color = this.p.color(180, 255, 120);
        this.colorPallet = getColorPallet();
        //this.textBox = new TextBox(this.p,'0.00%',0,0,p.width/2,p.height/2)
        }
    display(x,y, normalisedValue, threshold) {
        if (this.calibrating) {
            this.p.fill(this.colorPallet[4])
        } else if (this.hiden) {
            this.p.fill(255,255,255,100)
            this.p.noStroke()
            this.p.ellipse(x,y,this.radius+1,this.radius+1)
            this.p.fill(255,255,255)
        } else {
            this.p.stroke(this.colorPallet[7])
            this.p.strokeWeight(3)
            this.p.noFill()
            this.p.ellipse(x,y,this.radius+1,this.radius+1)
            this.p.noStroke()
            this.p.fill(this.colorPallet[4])
        }
        this.p.noStroke()

        let newRadius = this.p.map(normalisedValue,0.0, 1.0, this.radius*0.1, this.radius)
        let acivationRate = Math.floor(normalisedValue*100)
        this.p.ellipse(x,y,newRadius,newRadius)

        if (acivationRate>0 && !this.hiden) {
            this.p.fill(255)
            /*
            this.p.noStroke();
            this.p.textSize(this.radius / 3);
            this.p.rectMode(this.p.CENTER)
            this.p.text(acivationRate, x, y);
             */
        }
    }
    hide(bool) {
        this.hiden = bool
        if(bool) {
            this.color = this.p.color(255,255,255)
        } else {
            this.color = this.p.color(100, 255, 120)
        }
    }
    tone(normalisedValue) {
        if (normalisedValue>0 && this.osc == null) {
            this.osc = new this.Tone.Oscillator("20", "sine").toDestination().start();
            this.osc.partialCount = 3
        } else if (this.osc != null){
            // Frequency in Hz.
            // Set initial value. (you can use .value=freq if you want)
            this.osc.frequency.value = this.p.map(normalisedValue,0.0, 1.0, 30, 500)
        } else if (normalisedValue<0.2 && this.osc != null) {
            this.osc.stop()
        }
    }
}
export default Sensor
