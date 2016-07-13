// envsensor.js
// silver line environment sensors

var Device = require('zetta').Device;
var util = require('util');

var Dev = module.exports = function Driver(opts) {
    Device.call(this);
    
    // creating new properties
    this.assignedName = opts.name
    this.nodeid = opts.nodeid
    this.luminance = opts.luminance 
    this.temp = opts.temp
    this.batt = opts.batt
};
util.inherits(Dev, Device);

// initialize
Dev.prototype.init = function(config) {
     
    this.warn('env sensor discovered named ' + this.assignedName);


    var self = this
    
    config
        .type('routingbinarysensor')
        .name(this.assignedName)
        .state('ready')

    config
        .when('ready', { allow: ['updateBatteryLevel', 'updateLuminance', 'updateTemperature', 'updateMotionSensor'] })
        .map('updateBatteryLevel', self.updateBatteryLevel, [{type: 'number', name:'BatteryLevel'}])
        .map('updateLuminance', self.updateLuminance, [{type: 'number', name:'Luminance'}])
        .map('updateTemperature', self.updateTemperature, [{type: 'number', name: 'Temperature'}])
        .map('updateMotionSensor', self.updateMotionSensor, [{type: 'number', name: 'Temperature'}])
        .monitor('batt')
        .monitor('luminance')
        .monitor('temp')
};
 
// implement transition functions
Dev.prototype.updateBatteryLevel = function(batt, cb) {
    console.log('updating batt')
    this.batt = batt
    cb();
};
 
Dev.prototype.updateLuminance = function(luminance, cb) {
    console.log('updating luminance')
    this.luminance = luminance
    cb();
};
 
Dev.prototype.updateTemperature = function(temp, cb) {
    console.log('updating temp')
    this.temp = temp
    cb();
};
/* 
// the callback (cb) lets everyone know that we are done and good to go
Dev.prototype.turnOn = function(cb) {
    this.state = 'on';
    cb();
};
 
Dev.prototype.turnOff = function(cb) {
    this.state = 'off';
    cb();
};

Dev.prototype.streamValue = function(stream) {
    var counter = 0
    this.on( 'request', function(req, res) {
        this.warn('start')
        stream.write(counter)
        counter = (counter+1)%3
    }, 1000 )
}
*/
