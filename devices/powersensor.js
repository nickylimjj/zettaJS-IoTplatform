// powersensor.js
// silver line sensors

var Device = require('zetta').Device;
var util = require('util');
var debug = require('debug')('[dev] powerSensor')
var zwave = require('../zwave')

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
        .when('off', { allow: ['turn-on', 'updateSwitch', 'removeNode'] })
        .when('on', { allow: ['updateSwitch', 
            'updatePower', 
            'turn-off', 
            'getGroupInfo',
            'removeNode'
        ] })
         
        .map('turn-on', this.turnOn)
        .map('turn-off', this.turnOff)
        .map('updateSwitch', this.updateSwitch, [
                {type: 'string', name:'Switch'}
        ])
        .map('updatePower', this.updatePower, [
                {type: 'number', name: 'Power'}
        ])
         
        .map('getGroupInfo', this.getGroupInfo)
        .map('removeNode', this.removeNode)
        .monitor('power')
};
 
// implement transition functions
// the callback (cb) lets everyone know that we are done and good to go

Dev.prototype.updateSwitch = function (Switch, cb) {
    debug(this.nodeid)
    if (Switch === 'true') {
        debug('on')
        this.state = 'on';
        zwave.setValue( {node_id: this.nodeid, class_id: 37, instance: 1, index: 0}, true)
    } else if (Switch === 'false'){
        debug('off')
        this.state = 'off';
        zwave.setValue( {node_id: this.nodeid, class_id: 37, instance: 1, index: 0}, false)
    } else {
        debug('invalid input')
    }
    cb()
}
 
Dev.prototype.updatePower = function (Power, cb) {
    this.power = Power;
    zwave.setValue( {node_id: this.nodeid, class_id: 50, instance: 1, index: 0}, Power)
         
    cb()
}
 
Dev.prototype.turnOn = function (cb) {
    this.state = 'on'
    this.updateSwitch('true',cb)
}
 
Dev.prototype.turnOff = function (cb) {
    this.state = 'off'
    this.updateSwitch('false',cb)
}
 
Dev.prototype.getGroupInfo = function (cb) {
    debug('---')
    debug('has node failed? ' + zwave.hasNodeFailed(this.nodeid))
    debug('controller stuff:')
    debug(zwave.getControllerNodeId())
    debug(zwave.getLibraryVersion())
    debug('---')
    cb()
}

Dev.prototype.removeNode = function (cb) {
    zwave.removeFailedNode(this.nodeid)
    zwave.removeNode()
    cb()
}
