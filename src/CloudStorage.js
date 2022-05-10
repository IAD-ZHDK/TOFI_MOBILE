// firebase
let uid;
// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getDatabase, ref, set, child, get, push, update } from "firebase/database";
import { getAuth, EmailAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import Parameters from './Parameters'
let ons = require('onsenui')

const params = Parameters

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


export function writeToFB(deviceData) {
    // overwrites existing data
    const db = getDatabase();
    const writeRef = ref(db, 'users/' + uid+ '/data');
    set(writeRef, {
        deviceData,
    });
}
export function appendStatisticsFB(data) {
    // adds existing data
    const db = getDatabase();
    /*
    const postListRef = ref(db, 'users/' + uid + '/'+path);
    const newPostRef = push(postListRef);
    set(newPostRef, {
        data
    });
*/
    const log = { 'start': data.start, 'duration': data.duration, 'totalMovements': data.totalMovements, 'viewNumber': data.viewNumber, 'metric': data.metric, 'metricValue': data.metricValue}
    const updates = {};
    updates[ 'users/' + uid + '/statistics/histogram/'+data.start] = data;
    updates[ 'users/' + uid + '/statistics/log/'+data.start] = log;
  
    update(ref(db), updates);
}

export function createLoginFB() {
    var uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                // User successfully signed in.
                // Return type determines whether we continue the redirect automatically
                // or whether we leave that to developer to handle.
                document.getElementById('splashscreen').style.display = 'none';
                return true;
            },
            uiShown: function () {
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
            params.deviceProfile.uid = uid
            console.log("uid " + uid)
            console.log("display name " + user.displayName)
            document.getElementById('splashscreen').style.display = 'none';
            updateUserName();
            updateChanels();
           // updateLocalData();
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


export function updateUserName() {
    const dbRef = ref(getDatabase());
    get(child(dbRef, `users/${uid}/data/deviceData/USER_ID`)).then((snapshot) => {
        console.log("USER_ID: " + snapshot.val());
        if (snapshot.exists()) {
            console.log("USER_ID: " + snapshot.val());
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
}

export function updateChanels() {

    const dbRef = ref(getDatabase());
    get(child(dbRef, `users/${uid}/data/deviceData`)).then((snapshot) => {
        console.log("deviceData: " + snapshot.val());
        if (snapshot.exists()) {
            let data = snapshot.val()
            for (const [key, value] of Object.entries(data)) {
                //console.log(key)
                //console.log(value)
                let index = params.chanelNames.indexOf(key);
               //console.log(index); 
                if (index !== -1) {
                    // array contains string match
                    params.deviceProfile[Object.keys(params.deviceProfile)[index]].active = value.active
                    //this.deviceProfile[Object.keys(this.deviceProfile)[0]].active = false // Battery
                }

            }
            params.save()
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    });
}


export async function updateLocalData() {
    const dbRef = ref(getDatabase());
    const response = await get(child(dbRef, `users/${uid}/statistics`)).then((snapshot) => {
        if (snapshot.exists()) {
            let data = snapshot.val()
            let keys = []
            for (const [key, value] of Object.entries(data)) {
                keys.push(value.data.start);
                params.setLocal(value.data.start, value.data)
            }
            params.saveSessionKeys(keys);
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    });
    return response;
}

export async function getStatisticsLogs() {
    const dbRef = ref(getDatabase());
    const response = get(child(dbRef, `users/${uid}/statistics/log`))
    return response
}
export async function getStatisticsHistogram(timeStamp) {
    const dbRef = ref(getDatabase());
    const response = get(child(dbRef, `users/${uid}/statistics/histogram/`+timeStamp))
    return response
}

export function pulldatabase() {
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

export function signOutFB() {
    signOut(auth).then(() => {
        location.reload()
        // Sign-out successful.
    }).catch((error) => {
        // An error happened.
    });
}

function createBLEDialog() {
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