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
      this.keyControl[i] = this.params.getMin(i);
      this.filters[i] = 0
    }
  }

  setSensorFake(i) {
    if (this.keyControl[i] <= this.params.getMax(i)) {
      this.keyControl[i] = this.params.getMax(i)
    }
  }

  getSensorValues() {
    this.handleSensor ()
    return this.sensorValues;
  }

  handleSensor () {
    for (let i = 0; i < this.noChannels; i++) {
      let step = this.params.getMax(i)-this.params.getMin(i)
      step = step*0.01
      if (this.keyControl[i] > this.params.getMin(i)) {
        this.keyControl[i] -= step
      }
    }
    // apply filtering
    let filters = this.params.getFilters();
    for (let i = 0; i < this.noChannels; i++) {
      let filter = filters[i]
     // let noise  =  Math.floor(Math.random() * 10)
      if (filter > 0) {
        this.sensorValues[i] = Math.floor(this.sensorValues[i] * filter)
        this.sensorValues[i] += Math.floor((this.keyControl[i]) * (1.0 - filter))
      } else {
        this.sensorValues[i] = Math.floor(this.keyControl[i])
      }
    }
  }
}
export default BleSimulator
