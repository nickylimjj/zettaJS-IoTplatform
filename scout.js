// scout.js
// class that finds device connected to a Zetta server.
// runs perpetually in background to wait for devices to come online.
var Scout = require('zetta').Scout
var util = require('util')
var LED = require('./device')
 
// inheritance
var LEDScout = module.exports = function() {
    Scout.call(this)
} 
util.inherits(LEDScout, Scout);

LEDScout.prototype.init = function(next) {
   var self = this;

   // after 1s, our scout says it has found our LED
   setTimeout( function() {
       self.discover(LED, 'led_1');
       self.discover(LED, 'led_2');
   }, 1000);

   var counter = 0;
   setInterval( function(){
       counter++;
       console.log(counter+"s has passed.")
       //self.discover(LED, 'led_' + (counter+1))
       //console.log('discovered 1 more led.')
   }, 1000);
   
   // since async, this tells zetta when it is online and ready to proceed
   next();
}
