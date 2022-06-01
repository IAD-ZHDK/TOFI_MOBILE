class BleSimulator {
  // this class acts as a dummy BLE device when none is available. For debugging purposes.
  constructor (params) {
    this.params = params
    this.noChannels = 8
    this.isConnected = true
    this.sensorValues = []
    this.keyControl = []
    this.filters = []
    for (let i = 0; i < this.noChannels; i++) {
      this.sensorValues[i] = 0
      this.keyControl[i] = false;
      this.filters[i] = 0
    }
  }

  pressSensorFake(i) {
   // if (this.keyControl[i] <= this.params.getMax(i)) {
      this.keyControl[i] = true
    //}
  }

  releaseSensorFake(i) {
    // if (this.keyControl[i] <= this.params.getMax(i)) {
      this.keyControl[i] = false
  
     //}
   }

  getSensorValues() {
    this.handleSensor ()
    return this.sensorValues;
  }

  handleSensor () {
  
    // apply filtering
    //let filters = this.params.getFilters();
    for (let i = 0; i < this.noChannels; i++) {
      let filter = 0.91
     // let noise  =  Math.floor(Math.random() * 10)
      //if (filter > 0) {
        this.sensorValues[i] = this.sensorValues[i] * filter
        if (this.keyControl[i] == true) {
          this.sensorValues[i] += this.params.getMax(i) * (1.0 - filter)
          this.sensorValues[i] = Math.floor(this.sensorValues[i])
          if(Math.abs(this.sensorValues[i]-this.params.getMax(i))<20) {
            this.sensorValues[i] = this.params.getMax(i)
          }
        } else {
          this.sensorValues[i] += this.params.getMin(i) * (1.0 - filter)
          this.sensorValues[i] = Math.floor(this.sensorValues[i])
        }
   //   } else {
       // this.sensorValues[i] = Math.floor(this.keyControl[i])
    //  }

     //this.keyControl[i] = this.params.getMin(i)
    }
    /*
    for (let i = 0; i < this.noChannels; i++) {
      let step = this.params.getMax(i)-this.params.getMin(i)
      step = step * 0.03
      if (this.keyControl[i] > this.params.getMin(i)) {
        this.keyControl[i] -= step
      }
    }
   */
  }
   
}
export default BleSimulator
