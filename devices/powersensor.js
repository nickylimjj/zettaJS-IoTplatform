// sensor.js
// silver line sensors

var Device = require('zetta').Device;
var util = require('util');

var Dev= module.exports = function Driver(name) {
    Device.call(this);
    this.assignedName = name
};
util.inherits(Dev, Device);

// initialize
Dev.prototype.init = function(config) {
    var voltage = 0;
    config
        .type('power-sensor')
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
Dev.prototype.turnOn = function(cb) {
    this.voltage = 5;
    this.state = 'on';
    cb();
};
 
Dev.prototype.turnOff = function(cb) {
    this.voltage = 0;
    this.state = 'off';
    cb();
};
 