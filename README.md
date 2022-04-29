## A Cordova based enviroment for Android and IOS apps for TOFI trainer 

Built Using onsen UI framework and P5js


## How to install on osx

* Run `sudo npm install -g cordova`
* Run `cordova platform add browser`
* Run `cordova plugin add cordova-plugin-browsersync-gen2`
* Run `npm i cordova-plugin-webpack`

setup ssl proxy for testing BLE in browser
* Run `npm install -g local-ssl-proxy`

## How to test

* Run `cordova prepare -- --livereload`

To start a htps proxy, type in a seperate terminal window:

* Run `local-ssl-proxy --source 9000 --target 8080`

Open at https://localhost:9000/

## Production

* Run `cordova build`

## Build for github pages

* Run `cordova build browser`

## Emulation 

* Run `cordova emulate android`
* Run `cordova emulate IOS`

## GitHub Pages
Live Demo: 
https://iad-zhdk.github.io/TOFI_MOBILE/

##  TODO

integrate with https://github.com/don/cordova-plugin-ble-central

Modify status bar appearance on different platforms
https://cordova.apache.org/docs/en/10.x/reference/cordova-plugin-statusbar/

Firebase login support to be added