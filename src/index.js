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
let uid;

// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getDatabase, ref, set, child, get, push} from "firebase/database";
import { getAuth, EmailAuthProvider, onAuthStateChanged, signOut} from "firebase/auth";



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCaPlD2xiKEjD-VOEYCtuBM-j5NZr2OPw8",
    authDomain: "tofi-authenticated.firebaseapp.com",
    databaseURL: "https://tofi-authenticated-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "tofi-authenticated",
    storageBucket: "tofi-authenticated.appspot.com",
    messagingSenderId: "373383815047",
    appId: "1:373383815047:web:cba620c889c5fd8607fd22",
    measurementId: "G-ZTQXRTSSN8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Get a reference to the database service


const database = getDatabase(app);
const auth = getAuth(app);
var firebaseui = require('firebaseui');

var ui = new firebaseui.auth.AuthUI(auth);


function writeToDB(userId, deviceData) {
    // overwrites existing data
  const db = getDatabase();
  const writeRef = ref(db, 'users/' + userId + '/device');
  set(writeRef, {
    deviceData,
  });
}
function appendToDB(userId, data) {
      // adds existing data
    const db = getDatabase();
    const postListRef = ref(db, 'users/' + userId +'/statistics');
    const newPostRef = push(postListRef);
    set(newPostRef,{
        data    
    });
}

function createLogin() {
    var uiConfig = {
        callbacks: {
          signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            // User successfully signed in.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            document.getElementById('splashscreen').style.display = 'none';
            return true;
          },
          uiShown: function() {
            // The widget is rendered.
            // Hide the loader.
           // document.getElementById('loader').style.display = 'none';
          }
        },
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
       // signInFlow: 'popup',
       // signInSuccessUrl: '<url-to-redirect-to-on-success>',
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          {
            provider: EmailAuthProvider.PROVIDER_ID,
            requireDisplayName: true
          }
        ],
        // Terms of service url.
        //tosUrl: '<your-tos-url>',
        // Privacy policy url.
        //privacyPolicyUrl: '<your-privacy-policy-url>'
      };

      onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
          uid = user.uid;
          console.log("uid "+uid)
          console.log("display name "+user.displayName)
          document.getElementById('splashscreen').style.display = 'none';
          updateUserName(uid);
          params.deviceProfile.uid = uid
          createBLEDialog();
          // ...
        } else {
          // User is signed out
          // ...
          document.getElementById('logo').style.visibility = 'visible';
          ui.start('#splashscreen', uiConfig);
        }
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
    createLogin()
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

function updateUserName(uid) {
    const dbRef = ref(getDatabase());
    get(child(dbRef, `users/${uid}/deviceData/USER_ID`)).then((snapshot) => {
        console.log("USER_ID: "+snapshot.val());
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
        // todo: add client is offline message to app 
      console.error(error);
    });
}


function updateLocalData(uid) { 
    const dbRef = ref(getDatabase());
    get(child(dbRef, `users/${uid}/statistics`)).then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
           let data = snapshot.val()
      /*  for(let i = 0; i<data.length;i++) {
            console.log(data[i].data);
        }
        */
        for (const [key, entries] of Object.entries(data)) {
            console.log(`${key}: ${entries}`);
            for (const [key, value] of Object.entries(entries)) {
                console.log(`${key}: ${value}`);
              }
          }
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
}

function pulldatabase(uid) {
    const dbRef = ref(getDatabase());
    get(child(dbRef, `users/${uid}/statistics`)).then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val()
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
    return false
}

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
        userStats = new Stats(ctx, params, currentPage.index)
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
    updateLocalData(uid);
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
    let lastEntry = params.saveLocal();
    console.log("database save")
    appendToDB(uid, lastEntry) 
    writeToDB(params.deviceProfile.uid , params.getDeviceProfileJson())
    defineSketch({ "remove": true })
}
export function signOutFireBase() {
signOut(auth).then(() => {
    location.reload()
    // Sign-out successful.
  }).catch((error) => {
    // An error happened.
  });
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