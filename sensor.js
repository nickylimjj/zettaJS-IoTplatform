// sensor.js
// silver line sensors

var Device = require('zetta').Device;
var util = require('util');

var Sensor = module.exports = function SensorDriver(name) {
    Device.call(this);
    this.assignedName = name
};
util.inherits(Sensor, Device);

// initialize
Sensor.prototype.init = function(config) {
    var voltage = 0;
    config
        .type('sensor')
        .name(this.assignedName)
        .state('off')

    config
        .when('off', { allow: ['turn-on'] })
        .when('on', { allow: ['turn-off'] })
        .map('turn-on', this.turnOn)
        .map('turn-off', this.turnOff)
        .monitor('voltage')
};
 
// implement transition functions
// the callback (cb) lets everyone know that we are done and good to go
Sensor.prototype.turnOn = function(cb) {
    this.state = 'on';
    cb();
};
 
Sensor.prototype.turnOff = function(cb) {
    this.state = 'off';
    cb();
};
