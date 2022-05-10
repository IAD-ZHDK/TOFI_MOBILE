import P5 from 'p5'
import defineSketch from './Canvas.js'
import BLEhandler from './BLEhandler.js'
import Parameters from './Parameters'
import BleSimulator from './BleSimulator'
import CalibrationGUI from './CalibrationGUI'
import Stats from './Stats.js'
import statisticsMenu from './StatsMenu.js'

import {signOutFB, appendStatisticsFB, writeToFB, createLoginFB, getStatisticsLogs, getStatisticsHistogram} from "./CloudStorage.js";

import * as Tone from 'tone'
let ons = require('onsenui')

///
ons.disableIconAutoPrefix() // Disable adding fa- prefix automatically to ons-icon classes. Useful when including custom icon packs.
ons.platform.select("ios")
let blehandler
let currentView = 1
let calibrationGUI
let currentPage
let WEBGL = false
let params
let PFIVE
let userStats
let mobileDevice = false

class GUIInterface {
    constructor(object) {
        this.object = object;
    }
}

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false)

function onDeviceReady() {
    // Cordova is now initialized.
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version)
    createLoginFB()
    params = Parameters // myBLE.id // handles storage for paremeters for interpreting sensor values
    blehandler = new BleSimulator(params)
    document.addEventListener("click", HIDsetup, false);
 
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
        // true for mobile device
        mobileDevice = true;
      }
        // fal
}

// splash and loading screen

const wait = (delay = 0) =>
    new Promise(resolve => setTimeout(resolve, delay));

const setVisible = (elementOrSelector, visible) =>
    (typeof elementOrSelector === 'string'
        ? document.querySelector(elementOrSelector)
        : elementOrSelector
    ).style.display = visible ? 'block' : 'none';


// user keyboard for debuging when device not connected
document.addEventListener('keydown', function (event) {
    if (blehandler instanceof BleSimulator) {
        if (event.key == 1) {
            blehandler.setSensorFake(0)
        } else if (event.key == 2) {
            blehandler.setSensorFake(1)
        } else if (event.key == 3) {
            blehandler.setSensorFake(2)
        } else if (event.key == 4) {
            blehandler.setSensorFake(3)
        } else if (event.key == 5) {
            blehandler.setSensorFake(4)
        } else if (event.key == 6) {
            blehandler.setSensorFake(5)
        } else if (event.key == 7) {
            blehandler.setSensorFake(6)
        } else if (event.key == 8) {
            blehandler.setSensorFake(7)
        }
    }
});






//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////// Initial Setup ///////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

// loading / splash screen
document.addEventListener('DOMContentLoaded', () =>
    wait(100).then(() => {
        //setVisible('.page', true);
        setVisible('#loading', false);
    }));


document.addEventListener("init", DOMContentLoadedEvent, false)

function DOMContentLoadedEvent() {
    // run function after every dom content load
    // check for  p5-containerafter onsen UI dom change
    const containerElement = document.getElementById('p5-container')
    if (containerElement) {
        PFIVE = new P5(defineSketch({ "viewNumber": currentView, "blehandler": blehandler, "params": params, "tone": Tone, "WEGL3D": WEBGL }), containerElement)
    }
    let ctx = document.getElementById('myChart')
    if (ctx) {
        console.log("found graph")
        const promise = getStatisticsHistogram(currentPage.index);
        promise.then((snapshot) => {
           if (snapshot.exists()) {
               let data = snapshot.val()
               userStats = new Stats(ctx, data)
               // expected output: "Success!"
             } else {
               console.log("No data available");
           }});
    }

}

// sound
function HIDsetup() {
    // signInWithPopup(auth, provider)
    // setup fullscreen on mobile
    if (mobileDevice) {
        var doc = window.document;
        var docEl = doc.documentElement;

        var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
            requestFullScreen.call(docEl);
        }
    }


    // setupSound
    console.log("sound state " + Tone.context.state)
    // if (Tone.disposed == true) {
    //Tone = new Tone()
    // }

    if (Tone.context.state === 'closed') {
        console.log("start sound")
        // Tone.start();
        Tone.Master.mute = false;
        Tone.context.resume()

    } else if (Tone.context.state !== 'running') {
        Tone.context.resume()
        Tone.Master.mute = false;
        console.log("resume sound")
    }

}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////// UI /////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

// main application Onsen Segment

export function splash(time) {
    let t = time
    setTimeout(function () {
        document
            .getElementById('splashscreen')
            .hide()
    }, t)
}

document.addEventListener('postchange', function (event) {
    console.log('postchange event', event);
})

export function changeTab() {
    document.getElementById('tabbar').setActiveTab(1)
    console.log("change Tab")
}
export function hideAlertDialog() {
    document
        .getElementById('my-alert-dialog')
        .hide()
}
export function connectBLE() {
    setupBLE()
    hideAlertDialog()
}
export function populateStats() {
    // save cloud data to local
   // setVisible('#statsMenu', false);
 //  updateLocalData();
 const promise = getStatisticsLogs();
 promise.then((snapshot) => {
    if (snapshot.exists()) {
        let data = snapshot.val()
        statisticsMenu(data);
        // expected output: "Success!"
      } else {
        console.log("No data available");
    }});
}
export function openSensorHistogram() {
    this.pushPage({'id':'canvas.html', 'view':0, 'title':'Sensor Histogram'})
    calibrationGUI = new CalibrationGUI(params)
}

export function pushPage(page, anim) {

    if (anim) {
        document.getElementById('myNavigator').pushPage(page.id, { data: { title: page.title }, animation: anim });
    } else {
        document.getElementById('myNavigator').pushPage(page.id, { data: { title: page.title } })
    }
    if (page.WEBGL) {
        WEBGL = page.WEBGL;
    } else {
        WEBGL = false
    }
    currentView = page.view;
    currentPage = page
    console.log("set view" + page.title)
    //
}
export function backButton() {
    document.querySelector('#myNavigator').popPage()
    if (typeof calibrationGUI != "undefined") {
        calibrationGUI.removeGui()
     }
    let lastEntry = params.getSessionData();
    if (lastEntry != null) {
        console.log("database save")
        appendStatisticsFB(lastEntry) 
    }
    writeToFB(params.getDeviceProfileJson())
    defineSketch({ "remove": true })
}
export function signOutFireBase() {
    signOutFB();
}
export function changeButton() {
    document.getElementById('segment').setActiveButton(1)
}






//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////// BLE /////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

let setupBLE = function () {
    //   - "Android"
    //   - "BlackBerry 10"
    //   - "browser"
    //   - "iOS"
    //   - "WinCE"
    //   - "Tizen"
    //   - "Mac OS X"
    let devicePlatform = cordova.platformId;
    console.log(devicePlatform);
    if (devicePlatform == "browser") {
        blehandler = new BLEhandler(params)
        blehandler.connectAndStartNotify()
    } else if (devicePlatform == "iOS") {

    } else if (devicePlatform == "Android") {

    }
}

