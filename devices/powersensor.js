// powersensor.js
// silver line sensors

var Device = require('zetta').Device;
var util = require('util');

var Dev= module.exports = function Driver(opts) {
    Device.call(this);
    this.assignedName = opts.name;
    this.nodeid = opts.nodeid;
    this.power = 0;
    this.exporting = false;
};
util.inherits(Dev, Device);

// initialize
Dev.prototype.init = function(config) {
     
    this.warn('power sensor discovered named ' + this.assignedName);
     
    config
        .type('binarypowerswitch')
        .name(this.assignedName)
        .state('off')

    config
        .when('off', { allow: ['updateSwitch', 'updatePower', 'turn-on'] })
        .when('on', { allow: ['updateSwitch', 'updatePower', 'turn-off'] })
        .map('turn-on', this.turnOn)
        .map('turn-off', this.turnOff)
        .map('updateSwitch', this.updateSwitch, [
                {type: 'string', name:'Switch'}
                //{type: 'bool', name:'Exporting'},
                //{type: 'number', name: 'Power'}
        ])
        .map('updatePower', this.updatePower, [
                {type: 'number', name: 'Power'}
        ])
        .monitor('power')
};
 
// implement transition functions
// the callback (cb) lets everyone know that we are done and good to go

Dev.prototype.updateSwitch = function(Switch, cb) {
    console.log('updating power adapter state');
    console.log(arguments)
    if (Switch === 'true') {
        console.log('on')
        this.state = 'on';
        //this.exporting = Exporting;
        //this.power = Power;
    } else if (Switch === 'false'){
        console.log('off')
        this.state = 'off';
    } else {
        console.log('invalid input')
    }
    cb();
}
 
Dev.prototype.updatePower = function(Power, cb) {
    console.log('updating power');
    this.power = Power;
    cb();
}
 
Dev.prototype.turnOn = function(cb) {
    this.state = 'on';
    cb();
};
 
Dev.prototype.turnOff = function(cb) {
    this.state = 'off';
    cb();
};
 
