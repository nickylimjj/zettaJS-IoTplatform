// button.js
// class to model a device. defines states and allowable transitions.
// maps transitions to js fx to control actual device state
// in this example, we see an led model with states: on and off
 
var util = require('util')
var Device = require('zetta').Device

// setting up class 
var Dev = module.exports = function DeviceDriver(name) {
    Device.call(this)
    this.assignedName = name
}
util.inherits(Dev, Device); //Dev inherits from Device

// configure device
Dev.prototype.init = function(config) {
    config
        .type('button')
        .state('off')
        .name(this.assignedName);
     
    // state machine
    config
        .when('off', { allow: ['turn-on', 'toggle'] })
        .when('on', { allow: ['turn-off', 'toggle'] })
        .when('toggle', { allow: ['turn-on', 'turn-off'] })
        .map('turn-on', this.turnOn)
        .map('turn-off', this.turnOff)
        .map('toggle', this.toggle)

};

// implement transition functions
// the callback (cb) lets everyone know that we are done and good to go
Dev.prototype.turnOn = function(cb) {
    this.state = 'on';
    console.log('Emergency signal sent')
    cb();
};
 
Dev.prototype.turnOff = function(cb) {
    this.state = 'off';
    cb();
};
 
Dev.prototype.toggle = function(cb) {
    if (this.state === 'off') this.state = 'on'
    else if (this.state === 'on') this.state = 'off'
    cb();
};
