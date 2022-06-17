import P5 from 'p5'
import defineSketch from './Canvas.js'
import BLEhandler from './BLEhandler.js'
import Parameters from './Parameters'
import BleSimulator from './BleSimulator'
import CalibrationGUI from './CalibrationGUI'
import Stats from './Stats.js'
import statisticsMenu from './StatsMenu.js'

import { signOutFB, appendStatisticsFB, writeToFB, createLoginFB, getStatisticsLogs, getStatisticsHistogram } from "./CloudStorage.js";

import * as Tone from 'tone'
let ons = require('onsenui')

///
ons.disableIconAutoPrefix() // Disable adding fa- prefix automatically to ons-icon classes. Useful when including custom icon packs.
ons.platform.select("ios")
let blehandler
let calibrationGUI
let currentPage
let WEBGL = false
let params
let PFIVE
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
      // this line can be uncommented to junp to a view during development 
    //EntryPoint.pushPage({'id':'canvas.html', 'view':9, 'title':'tilt', 'WEBGL':true})
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // true for mobile device
        mobileDevice = true;
    }
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
            blehandler.pressSensorFake(0)
        } else if (event.key == 2) {
            blehandler.pressSensorFake(1)
        } else if (event.key == 3) {
            blehandler.pressSensorFake(2)
        } else if (event.key == 4) {
            blehandler.pressSensorFake(3)
        } else if (event.key == 5) {
            blehandler.pressSensorFake(4)
        } else if (event.key == 6) {
            blehandler.pressSensorFake(5)
        } else if (event.key == 7) {
            blehandler.pressSensorFake(6)
        } else if (event.key == 8) {
            blehandler.pressSensorFake(7)
        } 
    }
   // if (event.key == "F") {
   //     EntryPoint.pushPage({'id':'canvas.html', 'view':10, 'title':'meditation' })
  //  }
});

document.addEventListener('keyup', function (event) {
    if (blehandler instanceof BleSimulator) {
        if (event.key == 1) {
            blehandler.releaseSensorFake(0)
        } else if (event.key == 2) {
            blehandler.releaseSensorFake(1)
        } else if (event.key == 3) {
            blehandler.releaseSensorFake(2)
        } else if (event.key == 4) {
            blehandler.releaseSensorFake(3)
        } else if (event.key == 5) {
            blehandler.releaseSensorFake(4)
        } else if (event.key == 6) {
            blehandler.releaseSensorFake(5)
        } else if (event.key == 7) {
            blehandler.releaseSensorFake(6)
        } else if (event.key == 8) {
            blehandler.releaseSensorFake(7)
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

    let chart = document.getElementById('myChart')
    if (chart) {
        // handling graph creation
        const promise = getStatisticsHistogram(currentPage.index);
        promise.then((snapshot) => {
            if (snapshot.exists()) {
                let data = snapshot.val()
                console.log(data);
                const userStats = new Stats(chart, data)
                // expected output: "Success!"
            } else {
                console.log("No data available");
            }
        });
    } else {
            // check for  p5-containerafter onsen UI dom change
        const containerElement = document.getElementById('p5-container')
        if (containerElement) {
            PFIVE = new P5(defineSketch({ "viewNumber": currentPage.view, "blehandler": blehandler, "params": params, "tone": Tone, "WEGL3D": WEBGL }), containerElement)
        }
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
export function showAlertDialog() {
    document
        .getElementById('my-alert-dialog')
        .show()
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
        }
    });
}
export function openSensorHistogram() {
    this.pushPage({ 'id': 'canvas.html', 'view': 0, 'title': 'Sensor Histogram' })
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
    currentPage = page
    console.log("set view" + page.title)
    //
}
export function backButton() {

    // document.querySelector('#myNavigator').pushPage({'id':'canvas.html', 'view':0, 'title':'Sensor Histogram'})


    let key = 0;
    let lastEntry = params.getSessionData();
    if (lastEntry != null) {
        console.log("saveing... ")
        key = lastEntry.start
        // chaining promises of all database actions 
        appendStatisticsFB(lastEntry).then(() => {
            return writeToFB(params.getDeviceProfileJson())
        }).then(() => {
            console.log("saved to db")
            params.resetLogs()
            currentPage = { 'id': 'graph.html', 'title': 'graph', 'index': key, 'view': key }
            document.querySelector('#myNavigator').replacePage('graph.html')
            //document.querySelector('#myNavigator').popPage()
        })
        //document.querySelector('#myNavigator').replacePage('graph.html')
        // document.querySelector('#myNavigator').popPage()
    } else {
        console.log("no database save!")
        if (typeof calibrationGUI != "undefined") {
            calibrationGUI.removeGui()
        }
        document.querySelector('#myNavigator').popPage()
    }
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

