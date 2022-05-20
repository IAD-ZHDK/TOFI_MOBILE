import { map, constrain } from './views/viewUtils/MathUtils'

class Parameters {
  //
  // handles setting, saving and retrival of calibration settings
  // singleton class
  //
  constructor(key) {
    if (!Parameters.instance) {
      this.setupCookie(key)
      // this.setupDataLoger()
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
    this.chanelNames = ['Battery', 'Reference', 'Ch 6', 'Ch 5', 'Ch 4', 'Ch 3', 'Ch 2', 'Ch 1']
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
    // console.log('uid'+uid)
    this.deviceProfile.uid = "not defined";
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
    this.deltaPercentChange = {}
    this.deltaPercentChange.lastValues = [0, 0, 0, 0, 0, 0]; // for comparing changes in inputs
    this.deltaPercentChange.loged = [false, false, false, false, false, false, false];
    this.deltaPercentChange.prevousMillis = 0;
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
  /*
    setupDataLoger() {
      this.getSessionKeys()
    }
  */
  newLogSession(view) {
    this.timeElapsed = Date.now()
    let n = Date.now()
    this.thisSession = { 'loging': false, 'start': n, 'duration': 0, 'totalMovements': 0, 'viewNumber': view, 'log': { '0': {}, '1': {}, '2': {}, '3': {}, '4': {} }, 'metric': "none", 'metricValue': 0 }
    // console.log("local storage" + this.sessionKeys)
  }

  resetLogs() {
    this.thisSession.loging = false;
    this.thisSession = null;
  }

  enableLogingSave() {
    this.thisSession.loging = true;
  }
  logdata(sensorValues) {
    if (this.thisSession.start != null) {
      let millis = this.timeElapsed - this.thisSession.start
      sensorValues.forEach((value, index) => {
        this.thisSession.log[index].push(value)
      })
      this.thisSession.time.push(millis)
    }
  }

  logDataSparse(index, value, timeStamp) {
    this.thisSession.log[index.toString()][timeStamp.toString()] = value;
  }

  logSpeedResult(speedTime) {
    if (this.thisSession.start != null) {
      // let millis = this.timeElapsed - this.thisSession.start
      this.thisSession.metric = "speedTest"
      this.thisSession.metricValue = speedTime
    }
  }

  getDeviceProfileJson() {
    let cookieData = this.getCookie(this.cookieID)
    let json = JSON.parse(cookieData)
    return json
  }

  getSessionData() {
    console.log("session complete")
    //check for atleast a bit of data logged. 

    let totalLogEvents = 0
    if (this.thisSession != null) {
      for (const [key, subArray] of Object.entries(this.thisSession.log)) {
        totalLogEvents += Object.keys(subArray).length
      }
    } 
    if (this.thisSession != null && this.thisSession.loging == true && totalLogEvents >= 5) {
      console.log(this.thisSession)
      let millis = this.timeElapsed - this.thisSession.start
      this.thisSession.duration = millis
      //todo: add count of total activations and maximum preasure
      // if (this.thisSession.log[0].length > 10) {
      //only save session if there are at least 20 entries in log
      return this.thisSession
      // }
    }
    return null
  }

  getStatistics() {
    let statistics = [];
    let Storage = window.localStorage;
    for (var i = 0; i < Storage.length; i++) {
      try {
        const temp = JSON.parse(Storage.getItem(Storage.key(i)));
        if (typeof temp.start !== "undefined") {
          console.log(temp.start);
          statistics.push(temp);
        }
      } catch (e) {
        //  alert(e); ignore error
      }
    }
    return statistics
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
      //let checkThreshold = false
      let percentValues = this.getPercentActiveValues()
      let millis = Date.now()
      const interval = 50;
      const nominalChange = 6
      if (millis > this.timeElapsed + interval) {
        let timeStamp = millis - this.thisSession.start;
        this.timeElapsed = millis;
        for (let i = 0; i < percentValues.length; i++) {
          if (Math.abs(percentValues[i] - this.deltaPercentChange.lastValues[i]) >= nominalChange) {
            // log data if interval over 

            if (this.deltaPercentChange.loged[i] == false) {
              // log the last value too. 
              let newValue = this.deltaPercentChange.lastValues[i]
              if (newValue <= nominalChange) {
                // round down 
                newValue = 0;
              }
              this.logDataSparse(i, newValue, this.deltaPercentChange.prevousMillis);
            }
            this.logDataSparse(i, percentValues[i], timeStamp);
            this.deltaPercentChange.loged[i] = true;
          } else if (this.deltaPercentChange.loged[i] == true) {
            // log one more value after each log event
            this.logDataSparse(i, percentValues[i], timeStamp);
            this.deltaPercentChange.loged[i] = false;
          }
        }
        this.deltaPercentChange.lastValues = percentValues;

        this.deltaPercentChange.prevousMillis = timeStamp;
      }
      // log data if we reach peak of sensor press and 80 milis elapsed
      // const millis = Date.now()
      // if (checkThreshold && millis > this.timeElapsed + 80) {
      // log data if threshold reached
      // this.logdata(percentValues)

      // }
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

  getPercentActiveValues() {
    let Values = []
    for (let i = 0; i < this.noActive; i++) {
      Values[i] = Math.floor(this.getNormalisedActive(i) * 100)
    }
    return Values;
  }

  getNormalisedValues() {
    let Values = []
    for (let i = 0; i < this.sensorValues.length; i++) {
      Values[i] = this.getNormalisedValue(i)
    }
    return Values;
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

  appendToStorage(name, data) {
    let old = localStorage.getItem(name);
    if (old === null) old = "";
    localStorage.setItem(name, old + data);
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
const instance = new Parameters(4265345); // randomish number for storing key values
export default instance
