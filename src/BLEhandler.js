import { pushPage, showAlertDialog, backButton } from './index.js'
import { map, constrain, moveingWeightedAverageArray } from './views/viewUtils/MathUtils'
class BLEhandler {
  constructor(params) {
    this.params = params
    var isChromium = window.chrome;
    var winNav = window.navigator;
    var vendorName = winNav.vendor;
    var isOpera = typeof window.opr !== "undefined";
    var isIEedge = winNav.userAgent.indexOf("Edg") > -1;
    var isIOSChrome = winNav.userAgent.match("CriOS");

    if (isIOSChrome) {
      // is Google Chrome on IOS
    } else if (
      isChromium !== null || isOpera !== null &&
      typeof isChromium !== "undefined" &&
      vendorName === "Google Inc." &&
      isIEedge === false
    ) {
      // is Google Chrome or opera 
    } else {
      // not Google Chrome 
      window.alert('BLE may not work in your browser. Use Chrome or check for a list of compatible browsers here: https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API')
    }


    this.id = 'default'
    this.serviceUuid = 'a22a0001-ad0b-4df2-a4e2-1745cbb4dcee' // The UUID for the main service on the TOFI trainer sensors
    this.sensorsUuid = 'a22a0002-ad0b-4df2-a4e2-1745cbb4dcee'
    this.LEDServiceUuid = 'a22b0001-ad0b-4df2-a4e2-1745cbb4dcee' //
    this.LEDUuid = 'a22b0002-ad0b-4df2-a4e2-1745cbb4dcee'
    this.serviceUuidBAT = '0x180f'
    this.LEDcharacteristic;
    // this.SensorServiceUuid = 'A22A0001-AD0B-4DF2-A4E2-1745CBB4dCEE'
    console.log('looking for:' + this.serviceUuid.toLowerCase())
    // this.myBLE = new P5ble()
    this.noChannels = 8
    this.isConnected = false
    this.sensorValues = []
    for (let i = 0; i < this.noChannels; i++) {
      this.sensorValues[i] = 0
    }

    // this.myCharacteristic;
    // web ble api 

  }

  connectAndStartNotify() {

    let serviceUuid = this.serviceUuid.toLowerCase();
    let characteristicUuid = this.serviceUuid.toLowerCase();

    console.log('Requesting Bluetooth Device...');
    let options = {
      filters: [
        { services: [serviceUuid] },
        { services: [this.sensorsUuid] },
        { services: [this.LEDServiceUuid] },
        { services: [this.LEDUuid] },
      ],
      optionalServices: ['battery_service']
    }

  
     let isAvailable = navigator.bluetooth.getAvailability();
      console.log('Bluetooth is enabled: ', isAvailable);
    if (!isAvailable) {
      console.error(e);
      isAvailable = false;
      window.alert('BLE may not work in your browser. Use Chrome or check for a list of compatible browsers here: https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API')
    }

    let device = navigator.bluetooth.requestDevice(options)
      .then(device => {
        console.log('Connecting to GATT Server...');
        device.addEventListener('gattserverdisconnected', this.onDisconnected);
        return device.gatt.connect();
      })

    device.then(server => {
      console.log('Getting Battery Service...');
      return server.getPrimaryService("battery_service");
    })
      .then(service => {
        console.log('Getting battery_level Characteristic...');
        return service.getCharacteristic("battery_level");
      })
      .then(characteristic => {
         characteristic.startNotifications().then(_ => {
          console.log('> Notifications started');
          this.batteryNotifications = this.batteryNotifications.bind(this);
          characteristic.addEventListener('characteristicvaluechanged',
            this.batteryNotifications);
        })
        return characteristic.readValue();;
      }).then(value => {
        let batteryLevel = value.getUint8(0);
        this.drawBatIcon(batteryLevel);
      })
      .catch(error => {
        console.log('Argh! ' + error);
      });

    device.then(server => {
      console.log('Getting Sensor Service...');
      return server.getPrimaryService(this.serviceUuid);
    })
      .then(service => {
        console.log('Getting sensor Characteristic...');
        return service.getCharacteristic(this.sensorsUuid);
      })
      .then(characteristic => {
        return characteristic.startNotifications().then(_ => {
          console.log('> Notifications started');
          this.SensorNotifications = this.SensorNotifications.bind(this);
          characteristic.addEventListener('characteristicvaluechanged',
            this.SensorNotifications);
        });
      })
      .catch(error => {
        console.log('Argh! ' + error);
      });

    device.then(server => {
      console.log('Getting LED Service...');
      return server.getPrimaryService(this.LEDServiceUuid);
    })
      .then(service => {
        console.log('Getting LED Characteristic...');

        return service.getCharacteristic(this.LEDUuid);
      })
      .then(characteristic => {
        this.LEDcharacteristic = characteristic
        this.connectionStarted();
      })
      .catch(error => {
        console.log('Argh! ' + error);
      });

  }

  connectionStarted() {
    this.writeLED(0xFF)
    pushPage({ 'id': 'canvas.html', 'view': 1, 'title': 'calibration' })
  }

  batteryNotifications(event) {
    let value = event.target.value;
    let batteryLevel = value.getUint8(0);
    this.drawBatIcon(batteryLevel)
  }

  drawBatIcon(batteryLevel) {
    let batteryIcon = document.getElementById('batteryIcon')
    batteryIcon.style.display= "inline-flex";
    let batteryPercent = document.getElementById('batteryPercent')
    batteryPercent.textContent = batteryLevel+'%';
    let batteryIconBar = document.getElementById('batteryBar')
    let batteryBarWidth = 20*(batteryLevel/100); 
    batteryIconBar.style.width = batteryBarWidth+"px";
    console.log('🔋 ' + batteryLevel + '%');
  }

  SensorNotifications(event) {
    let data = event.target.value;
    // apply filtering
    let filters = this.params.getFilters();
    let newValues = []
    // extract 16 bit sensor values from hex
    for (let i = 0; i < this.noChannels; i++) {
      let byteCount = i * 2
      newValues[i] = data.getUint16(byteCount, true)
    }
    let averageValues = this.sensorValues
    moveingWeightedAverageArray(newValues, averageValues, filters)
  }


  writeLED(inputValue) {

    if (!this.LEDcharacteristic || !this.LEDcharacteristic.uuid) {
      console.error('The characteristic does not exist.');
    } else {
      let bufferToSend = Uint8Array.of(inputValue);
      this.LEDcharacteristic.writeValue(bufferToSend)
        .catch(() => {
          console.log("DOMException: GATT operation already in progress.")
          //return Promise.resolve()
          //        .then(() => this.delayPromise(500))
          //        .then(() => { characteristic.writeValue(value);});
        });
    }
  }

  onDisconnected(event) {
    let batteryIcon = document.getElementById('batteryIcon')
    batteryIcon.style.display= "none";
    console.log('Device was disconnected.')
    backButton()
    showAlertDialog();
    //todo: exit back to main menu.
  }

  getSensorValues() {
    return this.sensorValues;
  }

}
export default BLEhandler
