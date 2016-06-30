// scout.js
// class that finds device connected to a Zetta server.
// runs perpetually in background to wait for devices to come online.
var Scout = require('zetta').Scout
var util = require('util')
var LED = require('./devices/led')
var Screen = require('./devices/screen')
var PowerSensor = require('./devices/powersensor')
var EnvSensor = require('./devices/envsensor')
 
// inheritance
var myScout = module.exports = function() {
    Scout.call(this)
} 
util.inherits(myScout, Scout);

 
myScout.prototype.init = function(next) {
   var self = this;

   // name of device given here
 
   setTimeout( function() {
       self.discover(EnvSensor, 'env-sensor');
       console.log('env-sensor discovered')
   }, 1000);

   setTimeout( function() {
       self.discover(PowerSensor, 'power-adapter');
       console.log('power-adapter discovered')
   }, 1000);

   // after 1s, our scout says it has found our LED
   setTimeout( function() {
       self.discover(LED, 'led_1');
       self.discover(LED, 'led_2');
       console.log('2 leds discovered')
   }, 1000);


   setTimeout( function() {
       self.discover(Screen, 'main-screen');
       console.log('main-screen discovered')
   }, 1000);
   
   // since async, this tells zetta when it is online and ready to proceed
   next();
}
