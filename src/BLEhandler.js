import P5 from 'p5'
import P5ble from 'p5ble'
import { pushPage } from './index.js' 
import {map, constrain, moveingWeightedAverageArray} from './views/utils/MathUtils'
let that
class BLEhandler {
  constructor (params) {
    this.params = params
    /*
    let isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime)
    if (!isChrome) {
      window.alert('BLE may not work in your browser. Use Chrome or check for a list of compatible browsers here: https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API')
    }
    */
    this.id = 'default'
    this.serviceUuid = 'A22A0001-AD0B-4DF2-A4E2-1745CBB4dCEE' // The UUID for the main service on the TOFI trainer sensors
    this.serviceUuidLED = 'A22B0001-AD0B-4DF2-A4E2-1745CBB4dCEE' // The UUID for the main service on the TOFI trainer
    // this.SensorServiceUuid = 'A22A0001-AD0B-4DF2-A4E2-1745CBB4dCEE'
    console.log('looking for:' + this.serviceUuid)
    this.myBLE = new P5ble()
    this.noChannels = 8
    this.isConnected = false
    this.sensorValues = []
    for (let i = 0; i < this.noChannels; i++) {
      this.sensorValues[i] = 0
    }
    that = this
  }

  connectAndStartNotify () {
    // Connect to a device by passing the service UUID
    this.myBLE.disconnect()
    this.myBLE.connect(this.serviceUuid, this.gotCharacteristics)
    let gotValue = "";
   // this.myBLE.read(this.serviceUuidLED , 'string', gotValue)
    //console.log("led_"+gotValue)
   // this.myBLE.connect(this.serviceUuidLED, this.gotCharacteristicsLED)
  }
  gotCharacteristics (error, characteristics) {
    // A function that will be called after got characteristics
    if (error) {
      console.log('error: ', error)
    } else {
      that.params.setDeviceId(that.myBLE.device.id);
      console.log("BLE DEVICE ID"+that.myBLE.device.id)
      // Check if myBLE is connected
      that.isConnected = that.myBLE.isConnected()
      console.log('BLE connected: '+that.isConnected )
      that.id = that.myBLE.device.id
      // Add a event handler when the device is disconnected
      that.myBLE.onDisconnected(that.onDisconnected)
      for (let i = 0; i < characteristics.length; i++) {
        if (i === 0) {
          const sensorCharacteristic = characteristics[i]
          console.log(sensorCharacteristic);
          // Set datatype to 'custom', p5.ble.js won't parse the data, will return data as it is.
          that.myBLE.startNotifications(sensorCharacteristic, that.handleSensor, 'custom')
          console.log('characteristics: 1')
        } else if (i === 1) {
          console.log('characteristics: 2')
        } else if (i === 2) {
          console.log('characteristics: 3')
        } else {
          console.log("characteristic doesn't match.")
        }
      }
      pushPage({'id':'canvas.html', 'view':1, 'title':'calibration'})
    }
  }

  gotCharacteristicsLED(error, characteristics) {
    if (error) console.log('error: ', error);
    console.log('characteristics: ', characteristics);
    // Set the first characteristic as myCharacteristic
    let myCharacteristic = characteristics[0];
    writeToBle(myCharacteristic, "af")
  }

  onDisconnected () {
    console.log('Device was disconnected.')
    this.isCjonnected = false
  }

  getSensorValues() {
    return this.sensorValues;
  }
 writeToBle(myCharacteristic, input) {
  let inputValue = Math.floor(Math.random() * 0xff).toString(16);
  // Write the value of the input to the myCharacteristic
  console.log("write led Characteristic")
  myBLE.write(myCharacteristic, inputValue);
}

  handleSensor (data) {
    // apply filtering
    let filters = that.params.getFilters();
    let newValues = []
    // extract 16 bit sensor values from hex
    for (let i = 0; i < that.noChannels; i++) {
      let byteCount = i * 2
      newValues[i] = data.getUint16(byteCount, true)
    }
    let averageValues = that.sensorValues
    moveingWeightedAverageArray(newValues, averageValues, filters)
  }
}
export default BLEhandler
