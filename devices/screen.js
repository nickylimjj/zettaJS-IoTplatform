var Device = require('zetta').Device;
var util = require('util');

var Screen = module.exports = function ScreenDriver(name) {
    Device.call(this);
    this.assignedName = name;
};
util.inherits(Screen, Device);

Screen.prototype.init = function(config) {
    var written = '';
    var num = 1;

    config
        .type('screen')
        .name(this.assignedName)
        .state('ready');

    // state machine
    config
        .when('ready', { allow: ['write', 'add'] })
        // map(transition, func, [options]) with options type Array of objects
        .map('write', this.write, [ {type: 'text', name: 'textToWrite'} ])
        .map('add', this.add, [ {type: 'number', name: 'newNum'} ])
        .monitor('written') //monitor a property for changes
        .monitor('num')
};

Screen.prototype.write = function(textToWrite, cb) {
    // not changing state, just transiting back to 'ready' state
    this.written = textToWrite;
    cb();
}

Screen.prototype.add = function (newNum, cb) {
    this.num = newNum
    console.log('num = ' + this.num);
    cb();
}
