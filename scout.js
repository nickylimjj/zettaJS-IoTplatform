// scout.js
// class that finds device connected to a Zetta server.
// runs perpetually in background to wait for devices to come online.
var Scout = require('zetta').Scout
var util = require('util')
var LED = require('./led')
var Screen = require('./screen')
var Sensor = require('./sensor')
 
// inheritance
var myScout = module.exports = function() {
    Scout.call(this)
} 
util.inherits(myScout, Scout);

 
myScout.prototype.init = function(next) {
   var self = this;

   // name of device given here
 
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
     
   setTimeout( function() {
       self.discover(Sensor, 'power-adapter');
       console.log('power-adapter discovered')
   }, 1000);
    
   var counter = 0;
   setInterval( function(){
       counter = counter + 5;
       console.log(counter+"s has passed.")
       //self.discover(LED, 'led_' + (counter+1))
       //console.log('discovered 1 more led.')
   }, 5000);
   
   // since async, this tells zetta when it is online and ready to proceed
   next();
}
