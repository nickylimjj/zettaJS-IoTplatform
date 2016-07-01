// envsensor.js
// silver line environment sensors

var Device = require('zetta').Device;
var util = require('util');

var Dev = module.exports = function Driver(opts,name) {
    Device.call(this);
    
    // creating new properties
    this.assignedName = name
    this.value = opts.value 
    this.sensorID = opts.sensorID
    this.ts = opts.ts
    this.num = opts.num
};
util.inherits(Dev, Device);

// initialize
Dev.prototype.init = function(config) {
     
    this.warn('env sensor discovered', { hello: 'world' });

    var self = this
    
    config
        .type('env-sensor')
        .name(this.assignedName)
        .state('ready')

    config
        .when('ready', { allow: ['update'] })
        .monitor('sensorID')
        .monitor('ts')
        .monitor('value')
        .monitor('num')
        .map('update', self.update)

    // use POST to update it's own state
    setInterval(function() {
        //if (self.state  === 'ready') self.num = opts.num
        //console.log(opts.num)
    }, 100)
    

};
 
// implement transition functions
Dev.prototype.update = function(cb) {
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
