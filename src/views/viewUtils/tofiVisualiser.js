import Sensor from './Sensor'

// a simple visualisation of the Tofi trainer, and sensor activation for guiding it's use in varous contexts

class tofiVisualiser {
    constructor(p, x, y, width, height, params, Tone) {
        this.p = p
        this.width = width
        this.height = height
        this.params = params
        this.Tone = Tone
        this.sensorLocations = this.params.getActiveSensorLocations()
        this.sensorDisplays = []
        this.resize(x, y, width, height)
        // load and resize image to maintain aspect ratio
        this.opacity = 20;
    }

    resize(x, y, width, height) {
        this.width = width
        this.height = height
        this.x = x * this.p.width
        this.y = y * this.p.height
        this.centerX = this.x - (this.width / 2);
        this.centerY = this.y - (this.height / 2);
        this.setUpimage();
    }

    move(x, y) {
        this.x = x * this.p.width
        this.y = y * this.p.height
        this.centerX = this.x - (this.width / 2);
        this.centerY = this.y - (this.height / 2);
    }

    setUpimage() {
        this.img = this.p.loadImage('./img/tofiTopDown.png', img => {
            // fit and presserve aspect ratio 
            let ratio = (this.width / img.width)
            let newHeight = img.height * ratio
            if (newHeight < this.height) {
                this.height = newHeight
            } else {
                ratio = (this.height / img.height)
                this.width = img.width * ratio
            }
            this.img.resize(this.width, this.height) //
            this.centerX = this.x - (this.width / 2);
            this.centerY = this.y - (this.height / 2);
            if (this.sensorDisplays.length < 1) {
                // add sensors if they don't exist already
                let sensorValues = this.params.getSensorValues()
                for (let i = 0; i < sensorValues.length; i++) {
                    this.sensorDisplays[i] = new Sensor(this.p, this.width * 0.21, this.Tone)
                }
            } else {
                for (let i = 0; i < this.sensorDisplays.length; i++) {
                    this.sensorDisplays[i].radius = this.width * 0.21
                }
            }
        });
    }

    setMockValues(mockValues) {
        // set mock sensor values
        this.mockValues = mockValues
        if (typeof this.mockValues === "undefined") {
            for (let i = 0; i < this.sensorDisplays.length; i++) {
                this.sensorDisplays[i].calibrating = false;
            }
        } else {
            for (let i = 0; i < this.sensorDisplays.length; i++) {
                this.sensorDisplays[i].calibrating = true;
            }
        }
    }
    hideSensors() {
        for (let i = 0; i < this.sensorDisplays.length; i++) {
            this.sensorDisplays[i].hide(true)
        }
    }
    showSensors() {
        for (let i = 0; i < this.sensorDisplays.length; i++) {
            this.sensorDisplays[i].hide(false)
        }
    }

    showOutline() {
        this.p.push();
        this.centerX = this.x - (this.width / 2);
        this.centerY = this.y - (this.height / 2);
        this.p.translate(this.centerX, this.centerY);
        this.p.image(this.img, 0, 0);
        this.p.pop();
    }

    display(option0, option1, option2, option3, option4, option5, option6) {
        let sensorValues
        if (typeof this.mockValues === "undefined") {
            sensorValues = this.params.getNormalisedActiveValues()
        } else {
            sensorValues = this.mockValues;
        }

        if (this.sensorDisplays.length > 1) {
            // turn on and off sensor display
            if (arguments.length > 0) {
                this.hideSensors()
                for (let i = 0, j = arguments.length; i < j; i++) {
                    if (arguments[i] < this.sensorDisplays.length) {
                        this.sensorDisplays[arguments[i]].hide(false)
                    }
                }
            }
            // draw from middle
            this.p.push();
            this.p.translate(this.centerX, this.centerY);
            this.p.image(this.img, 0, 0);
            // this.p.rect(0,0,this.width,this.height)
            for (let i = 0; i < sensorValues.length; i++) {
                // convert from normalised to cartesian coordinates
                let x = this.sensorLocations[i].x * this.width;
                let y = this.sensorLocations[i].y * this.height;
                this.sensorDisplays[i].display(x, y, sensorValues[i], 0.8)
                /*
                if (sensorValues[i].threshold) {
                    this.p.fill(0, 255, 120)
                } else {
                    this.p.fill(180, 255, 120)
                }
                this.p.ellipse(x, y, 10+sensorValues[i].value*70)
                 */
            }
            this.p.pop();
        }
    }
}
export default tofiVisualiser
