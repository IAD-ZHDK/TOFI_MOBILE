import P5 from 'p5'
import defineSketch from './Canvas.js'
import BLEhandler from './BLEhandler.js'
import Parameters from './Parameters'
import BleSimulator from './BleSimulator'
import CalibrationGUI from './CalibrationGUI'
import Stats from './Stats.js'
import statisticsMenu from './StatsMenu.js'

import * as Tone from 'tone'
let ons = require('onsenui')
// firebase

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
//import { getDatabase } from "firebase/database";
import { getDatabase, ref, set, child, get} from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDPRZBAHchzk6sAWxnvojUy5GqqoQPr2pU",
  authDomain: "tofi-database.firebaseapp.com",
  databaseURL: "https://tofi-database-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "tofi-database",
  storageBucket: "tofi-database.appspot.com",
  messagingSenderId: "245711251379",
  appId: "1:245711251379:web:ada882217aff57f4b94dc6",
  measurementId: "G-ZFMEML92FF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Get a reference to the database service
const database = getDatabase(app);

function writeTODataBase(userId, deviceData, stats) {
  const db = getDatabase();
  set(ref(db, 'users/' + userId), {
    device: deviceData,
    statistics: stats,
  });
}






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
    // add gui
    // show connect device dialog
    console.log("new dialog")
    createBLEDialog()
    params = Parameters // myBLE.id // handles storage for paremeters for interpreting sensor values
    blehandler = new BleSimulator(params)
    document.addEventListener("click", HIDsetup, false);
 

 
    // get user name from database if it exists 
    const dbRef = ref(getDatabase());

    get(child(dbRef, `users/${params.deviceProfile.Random_ID}/device/USER_ID`)).then((snapshot) => {
      if (snapshot.exists()) {
        console.log("USER_ID: "+snapshot.val());
        if (params.deviceProfile.USER_ID === "not defined") {
            params.deviceProfile.USER_ID = snapshot.val();
            params.save();
        }
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });

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

//setVisible('.page', false);
setVisible('#loading', true);

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
        PFIVE = new P5(defineSketch({ "viewNumber": currentView, "blehandler": blehandler, "params": params, "tone": Tone, "WEGL3D": WEBGL }), containerElement)

    }
    let ctx = document.getElementById('myChart')
    if (ctx) {
        console.log("found graph")
        userStats = new Stats(ctx, params, currentPage.index)
    }

}

// sound
function HIDsetup() {

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
    statisticsMenu(ons, params)
}
export function openSensorHistogram() {
    this.pushPage({'id':'canvas.html', 'view':0, 'title':'Sensor Histogram'})
    calibrationGUI = new CalibrationGUI(params)
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
    if (typeof calibrationGUI != "undefined") {
        calibrationGUI.removeGui()
     }
   
    defineSketch({ "remove": true })
    if (params.deviceProfile.BLE_ID === "not defined") {
        console.log("no ble id found")
    } else {
        console.log("database save")
        writeTODataBase(params.deviceProfile.Random_ID, params.getDeviceProfileJson(), params.loadLocal())
    }

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
            .then(function (dialog) {
                dialog.show()
            })
    }
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