// sensor.js
// silver line environment sensors

var Device = require('zetta').Device;
var util = require('util');

var Dev = module.exports = function Driver(name) {
    Device.call(this);
    this.assignedName = name
};
util.inherits(Dev, Device);

// initialize
Dev.prototype.init = function(config) {
    var temp = 0;
    config
        .type('env-sensor')
        .name(this.assignedName)
        .state('on')

    config
        .when('off', { allow: ['turn-on'] })
        .when('on', { allow: ['turn-off'] })
        .map('turn-on', this.turnOn)
        .map('turn-off', this.turnOff)
        .monitor('temp')
};
 
// implement transition functions
// the callback (cb) lets everyone know that we are done and good to go
Dev.prototype.turnOn = function(cb) {
    this.state = 'on';
    cb();
};
 
Dev.prototype.turnOff = function(cb) {
    this.state = 'off';
    cb();
};
