import P5 from 'p5'
import defineSketch from './Canvas.js'
import BLEhandler from './BLEhandler.js'
import Parameters from './Parameters'
import BleSimulator from './BleSimulator'
import CalibrationGUI from './CalibrationGUI'
import Stats from './Stats.js'

import * as Tone from 'tone'
let ons = require('onsenui')
//
ons.disableIconAutoPrefix() // Disable adding fa- prefix automatically to ons-icon classes. Useful when including custom icon packs.

let blehandler
let currentView = 1
let calibrationGUI
let currentPage
let WEBGL = false
let params
let PFIVE
let userStats

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
    // add gui
    // show connect device dialog
    console.log("new dialog")
    createBLEDialog()
    params = Parameters // myBLE.id // handles storage for paremeters for interpreting sensor values
    blehandler = new BleSimulator(params)
    calibrationGUI = new CalibrationGUI(params)
    calibrationGUI.toggle(false)
    document.addEventListener("click", RunToneConext, false);
    // populate statistics menu
    statisticsMenu()
}

// splash and loading screen

const wait = (delay = 0) =>
    new Promise(resolve => setTimeout(resolve, delay));

const setVisible = (elementOrSelector, visible) =>
    (typeof elementOrSelector === 'string'
            ? document.querySelector(elementOrSelector)
            : elementOrSelector
    ).style.display = visible ? 'block' : 'none';

//setVisible('.page', false);
setVisible('#loading', true);

// user keyboard for debuging when device not connected
document.addEventListener('keydown', function(event) {
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
        }else if (event.key == 7) {
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
    wait(2000).then(() => {
        //setVisible('.page', true);
        setVisible('#loading', false);
    }));


document.addEventListener("init", DOMContentLoadedEvent, false)

function DOMContentLoadedEvent() {
    // run function after every dom content load
    // check for  p5-containerafter onsen UI dom change
    const containerElement = document.getElementById('p5-container')
    if (containerElement) {
        PFIVE = new P5(defineSketch({"viewNumber" : currentView, "blehandler":blehandler, "params" : params, "tone":Tone, "WEGL3D" : WEBGL }), containerElement)
        if (currentView == 0) {
            calibrationGUI.toggle(true)
        }
    }
        let ctx = document.getElementById('myChart')
        if (ctx) {
            console.log("found graph")
            userStats = new Stats(ctx, params, currentPage.index)
        }
}

// sound
function RunToneConext() {

    console.log("sound state "+Tone.context.state )
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

export function pushPage(page, anim) {

    if (anim) {
        document.getElementById('myNavigator').pushPage(page.id, { data: { title: page.title }, animation: anim });
    } else {
        console.log(document.getElementById('myNavigator').pushPage(page.id, { data: { title: page.title } }));
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
    calibrationGUI.toggle(false)
    defineSketch({"remove" : true})
    statisticsMenu()
}
export function changeButton() {
    document.getElementById('segment').setActiveButton(1)
}


export function createBLEDialog() {
    var dialog = document.getElementById('my-alert-dialog')
    if (dialog) {
        dialog.show();
    } else {
        ons.createElement('ble-alert-dialog.html', { append: true })
            .then(function(dialog) {
                dialog.show()
            })
    }
}

export function statisticsMenu() {
    // populate statiticsMenu with Items
    const menu = document.querySelector('#statsList')
    let data = params.getSessionKeys()
    if (data !== null) {
        let sliceIndex = data.length - menu.childElementCount
        if (sliceIndex > 0) {
            // add missing menu items
            for (let i = data.length - sliceIndex; i < data.length; i++) {
                const dateObject = new Date(data[i])
                let title = dateObject.toLocaleString() //2019-12-9 10:30:15
                let metricName = params.loadLocal(i).metric
                let metricValue = params.loadLocal(i).metricValue
                if (metricName == "speedTest") {
                    const menuItem = ons.createElement(`<p style="text-align: center;""> speed test: ${metricValue}  ${title} </p>`)
                    menu.appendChild(menuItem)
                } else {
                const menuItem = ons.createElement(`<ons-button modifier="large" style="margin-bottom: 10px;" onclick="EntryPoint.pushPage({'id':'graph.html', 'title':'graph', 'index':'${i}'})">${title}</ons-button>`)
                menu.appendChild(menuItem)
                }
            }
        }
    } else {
        //TODO: add message that there is no data recorded yet
    }
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////// BLE /////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

let setupBLE = function() {
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



/*
ble.scan([], 5, function(device) {
    console.log(JSON.stringify(device));
}, failure);
*/




/*
let script   = document.createElement("script");
script.type  = "text/javascript";
script.src   = "js/game_01.js";
let element = document.getElementById("p5-container");
document.body.appendChild(script);

if(typeof(element) != 'undefined' && element != null){
    document.body.appendChild(script);
} else{
    alert('Element does not exist!');
}
*/