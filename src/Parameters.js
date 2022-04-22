import { connectDatabaseEmulator } from 'firebase/database'
import { map, constrain } from './views/utils/MathUtils'

let logingData = true
let threshold = 30 // only record data when above 30 pressure on sensor
class Parameters {
  //
  // handles setting, saving and retrival of calibration settings
  // singleton class
  //
  constructor(key) {
    if (!Parameters.instance) {
      this.setupCookie(key)
      this.setupDataLoger()
      Parameters.instance = this;
    }
    this.checkNoActive() // run once to count active channels
    return Parameters.instance;
  }

  ////////////
  // data handling
  ////////////
  setupCookie(key) {
    this.cookieID = key
    this.noChannels = 8
    const exterior = { "x": 0.5, "y": 0.33 };
    const incisivePapilla = { "x": 0.5, "y": 0.55 };
    const hardpalateMiddle = { "x": 0.5, "y": 0.75 };
    const hardpalateLeft = { "x": 0.3, "y": 0.8 };
    const hardpalateRight = { "x": 0.7, "y": 0.8 };
    this.sensorLocationsV1 = [/*Ch 6*/hardpalateLeft,
                            /*Ch 5*/hardpalateMiddle,
                            /*Ch 4*/exterior,
                            /*Ch 3*/incisivePapilla,
                            /*Ch 2*/hardpalateRight,]; // todo: make these configurable in front end
    this.sensorLocationsV2 = [/*Ch 1*/hardpalateLeft,
                            /*Ch 4*/incisivePapilla,
                            /*Ch 3*/exterior,
                            /*Ch 2*/hardpalateMiddle,
                            /*Ch 5*/hardpalateRight]; // todo: make these configurable in front end
    this.activeChanels = [] // array of indexes for retrieving active chanels only
    this.activeSensorLocations = [] //
    this.chanelNames = ['Battery', 'Reference', 'Ch 6', 'Ch 5', 'Ch  4', 'Ch 3', 'Ch 2', 'Ch 1']
    this.deviceProfile = {}
    for (let i = 0; i < this.noChannels; ++i) {
      this.deviceProfile[this.chanelNames[i]] = {
        'active': true,
        'filter': 0.6,
        'min': 30700,
        'max': 32000,
        'threshold': 31000,
        'x': 0.0,
        'y': 0.0
      }
    }
    // random userName 
    let randomNouns = ["time","year","way","day","thing","world","life","hand","part","eye","place","work","week","case","point","government","company","number","group","problem","fact"];
    let randomAdective = ["good","new","first","last","long","great","little","own","other","right","big","high","different","small","large","next","early","young","important","few","public","same","able"];
    let adjective = randomAdective[Math.floor(Math.random() * randomNouns.length)];
    let noun = randomNouns[Math.floor(Math.random() * randomAdective.length)];
    this.deviceProfile.Random_ID = adjective+noun+Math.floor(Math.random() * 100);
    this.deviceProfile.BLE_ID = "not defined";
    this.deviceProfile.USER_ID = "not defined";
    // hard code default chanel configuration
    this.deviceProfile[Object.keys(this.deviceProfile)[0]].active = false // Battery
    this.deviceProfile[Object.keys(this.deviceProfile)[1]].active = false // Reference
    this.deviceProfile[Object.keys(this.deviceProfile)[7]].active = false // Ch 1

    let cookieData = this.getCookie(this.cookieID)
    if (cookieData !== '' && cookieData !== 'undefined') {
      let obj = JSON.parse(cookieData)
      console.log('old cookie')
      Object.assign(this.deviceProfile, obj)
    } else {
      console.log('no cookie')  
      this.save();
    }
  }

  save() {
    this.checkNoActive()
    // creat Json object and set cookie
    console.log('object to json cookie set')
    let myJSON = JSON.stringify(this.deviceProfile)
    this.setCookie(myJSON, 2000)
  }
  // https://www.w3schools.com/js/js_cookies.asp
  setCookie(cvalue, exdays) {
    let d = new Date()
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
    let expires = 'expires=' + d.toUTCString()
    document.cookie = this.cookieID + '=' + cvalue + ';' + expires + ';path=/'
    // console.log(this.getCookie(this.cookieID))
  }

  getCookie(cname) {
    let name = cname + '='
    let ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') {
        c = c.substring(1)
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length)
      }
    }
    return ''
  }
  // localStorage

  setupDataLoger() {
    this.getSessionKeys()
  }

  newLogSession(view) {
    if (logingData) {
      this.timeElapsed = Date.now()
      let n = Date.now()
      let key = this.cookieID
      this.thisSession = { 'start': n, 'start': n, 'duration': 0, 'totalMovements': 0, 'viewNumber': view, 'log': [[], [], [], [], [], [], [], []], 'time': [], 'metric': "none", 'metricValue':0 }
      //
      // console.log("local storage" + this.sessionKeys)
    }
  }

  saveSessionKeys() {
    let Storage = window.localStorage
    let key = this.cookieID
    // create a list of all previous sessions
    if (this.sessionKeys !== null && this.sessionKeys !== '' && this.sessionKeys !== 'undefined') {
      this.sessionKeys.push(this.thisSession.start)
    } else {
      this.sessionKeys = [1]
      this.sessionKeys[0] = this.thisSession.start
    }
    // add new sessionkey
    Storage.setItem(key, JSON.stringify(this.sessionKeys))
  }

  logdata(sensorValues) {
    if (logingData && this.thisSession.start != null) {
      let millis = this.timeElapsed - this.thisSession.start
      sensorValues.forEach((value, index) => {
        this.thisSession.log[index].push(sensorValues[index])
        // todo: find more effiecient way of storing empty values
      })
      this.thisSession.time.push(millis)
    }
  }

  logSpeedResult(speedTime) {
    if (logingData && this.thisSession.start != null) {
      let millis = this.timeElapsed - this.thisSession.start
        this.thisSession.metric = "speedTest"
        this.thisSession.metricValue = speedTime
      this.thisSession.time.push(millis)
    }
  }

  detectPeaks(data, windowWidth, threshold) {
    const peaks = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - windowWidth);
      const end = Math.min(data.length, i + windowWidth);
      let deltaAcc = 0;
      for (let a = start; a < end; a++) {
        deltaAcc += Math.abs(data[a - 1] - data[a]);
      }
      if (deltaAcc > threshold) {
        peaks.push(i);
      }
    }
    return peaks;
  }

  getSessionKeys() {
    let key = this.cookieID
    let Storage = window.localStorage
    this.sessionKeys = JSON.parse(Storage.getItem(key))
    return this.sessionKeys
  }

  getLocalStorage() {
    let cookieData = this.getCookie(this.cookieID)
    let StorageString = JSON.stringify(window.localStorage)
    cookieData += StorageString
    return cookieData
  }

  

  getDeviceProfileJson() {
    let cookieData = this.getCookie(this.cookieID)
    let json = JSON.parse(cookieData)
    return json
  }

  saveLocal() {
    let Storage = window.localStorage;
    if (this.thisSession != null) {
      let millis = this.timeElapsed - this.thisSession.start
      this.thisSession.duration = millis
      //todo: add count of total activations and maximum preasure
      if (this.thisSession.log[0].length > 20) {
        //only save session if there are at least 20 entries in log
        this.saveSessionKeys()
        Storage.setItem(this.thisSession.start, JSON.stringify(this.thisSession))
      }
      this.thisSession = null
    }
  }

  loadLocal(index) {
    if (index >= 0) {
      let Storage = window.localStorage;
      this.getSessionKeys()
      let data = []
      if (this.sessionKeys[index] != null) {
        let data = JSON.parse(Storage.getItem(this.sessionKeys[index]))
        return data
      } else {
        let data = JSON.parse(Storage.getItem(this.sessionKeys[0]))
        return data
      }

    } else {
      // return all local data
      let Storage = window.localStorage;
      this.getSessionKeys()
      let data = []
      if (this.sessionKeys != null) {
        for (let i = 0; i < this.sessionKeys.length; i++) {
          data.push(JSON.parse(Storage.getItem(this.sessionKeys[i])))
        }
      }
      return data
    }
  }

  //////
  // General Utilities
  /////
  getFilters() {
    let filters = []
    for (let i = 0; i < this.noChannels; i++) {
      filters[i] = this.deviceProfile[Object.keys(this.deviceProfile)[i]].filter
    }
    return filters
  }
  getThreshold(i) {
    return this.deviceProfile[Object.keys(this.deviceProfile)[i]].threshold
  }
  atThreshold(i) {
    if (this.sensorValues[i] > this.getThreshold(i)) {
      return true
    } else {
      return false
    }
  }
  getMin(i) {
    return this.deviceProfile[Object.keys(this.deviceProfile)[i]].min
  }
  getMax(i) {
    return this.deviceProfile[Object.keys(this.deviceProfile)[i]].max
  }

  setSensorValues(sensorValues) {
    this.sensorValues = sensorValues;
    if (this.sensorValues != null) {
      let checkThreshold = false
      let percentValues = this.getPercentValues()
      for (let i = 0; i < this.sensorValues.length; i++) {
        if (percentValues[i] >= 30) {
          checkThreshold = true
        }
      }
      // log data if we reach peak of sensor press and 80 milis elapsed
      const millis = Date.now()
      if (checkThreshold && millis > this.timeElapsed + 80) {
        // log data if threshold reached
        this.logdata(percentValues)
        this.timeElapsed = millis
      }
    }
  }

  getSensorValue(i) {
    return this.sensorValues[i]
  }

  getSensorValues() {
    return this.sensorValues
  }

  getPercentValues() {
    let Values = []
    for (let i = 0; i < this.sensorValues.length; i++) {
      Values[i] = Math.floor(this.getNormalisedValue(i) * 100)
    }
    return Values;
  }

  getNormalisedValues() {
    let normaliseValues = []
    for (let i = 0; i < this.sensorValues.length; i++) {
      normaliseValues[i] = this.getNormalisedValue(i)
    }
    return normaliseValues;
  }

  getNormalisedValuesByte() {
    // TODO: for storing log in bytes
  }

  getNormalisedValue(i) {
    let normaliseValue
    let active = this.getIsActive(i)
    let min = this.getMin(i)
    let max = this.getMax(i)
    if (active) {
      normaliseValue = constrain(this.sensorValues[i], min, max)
      normaliseValue = map(normaliseValue, min, max, 0.0, 1.0)
    } else {
      normaliseValue = 0;
    }
    return normaliseValue
  }
 
  ////////////
  // methods for active chanels
  ///////////
  getNormalisedActiveValues() {
    let normaliseValues = []
    for (let i = 0; i < this.noActive; i++) {
      normaliseValues[i] = this.getNormalisedValue(this.activeChanels[i])
    }
    return normaliseValues;
  }

  getNormalisedActive(i) {
    return this.getNormalisedValue(this.activeChanels[i])
  }


  getIsActive(i) {
    // get if the chanel is active
    return this.deviceProfile[Object.keys(this.deviceProfile)[i]].active
  }

  getActive(i) {
    // get active chanel value
    return this.sensorValues[this.activeChanels[i]];
  }

  getAllActive() {
    // get all active chanel values
    let allActiveChanels = []
    for (let i = 0; i < this.noActive; i++) {
      allActiveChanels[i] = this.sensorValues[this.activeChanels[i]]
    }
    return allActiveChanels
  }


  getActiveAtThreshold(i) {
    if (this.sensorValues[this.activeChanels[i]] > this.getThreshold(this.activeChanels[i])) {
      return true
    } else {
      return false
    }
  }

  checkNoActive() {
    this.noActive = 0;
    this.activeChanels = []
    for (let i = 0; i < this.noChannels; ++i) {
      let active = this.getIsActive(i)
      if (active) {
        this.activeChanels[this.noActive] = i
        this.activeSensorLocations[this.noActive] = i
        this.noActive++
      }
    }
    return this.noActive
  }

  getActiveSensorLocations() {
    // this checks if sensors are configured for 1st of 2nd generation sensors
    this.checkNoActive()
    let sensorPositions
    let startIndex = 1;
    let endIndex = 8;
    if (this.getIsActive(2) && !this.getIsActive(7)) {
      startIndex = 2;
      endIndex = 6;
      sensorPositions = this.sensorLocationsV1 // 1st generation
    } else if (!this.getIsActive(2) && this.getIsActive(7)) {
      startIndex = 3;
      endIndex = 7;
      sensorPositions = this.sensorLocationsV2 // 2nd generation
    } else {
      sensorPositions = this.sensorLocationsV1
      sensorPositions.push({ "x": 0.9, "y": 0.9 }) // add another sensor location for new chanel
      console.log("more sensors active then alowed!")
    }
    let sensorPositionsUpdated = []
    // remove any diactivated sensors 
    let index = 0
    for (let i = startIndex; i <= endIndex; ++i) {
      let active = this.getIsActive(i)
      if (active) { 
        sensorPositionsUpdated.push(sensorPositions[index])
      }
      index++
    }
    return sensorPositionsUpdated;
  }

  getNoActive() {
    return this.noActive
  }

  setMin(i, value) {
    let index = this.activeChanels[i]
    this.deviceProfile[Object.keys(this.deviceProfile)[index]].min = value
  }
  setMax(i, value) {
    let index = this.activeChanels[i]
    this.deviceProfile[Object.keys(this.deviceProfile)[index]].max = value
  }
  setDeviceId(iD) {
    this.deviceProfile.BLE_ID = iD; 
  }
  getData() {
  }
}
const instance = new Parameters(4265345);
export default instance
