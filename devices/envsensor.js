// envsensor.js
// silver line environment sensors

var Device = require('zetta').Device;
var util = require('util');

var Dev = module.exports = function Driver(name) {
    Device.call(this);
    
    // creating new properties
    this.assignedName = name
    this.temp = 0 
    this.sensor_id = 0
};
util.inherits(Dev, Device);

// initialize
Dev.prototype.init = function(config) {
    this.warn('some info message', { hello: 'world' });
    
    config
        .type('env-sensor')
        .name(this.assignedName)
        .state('on')

    config
        .when('off', { allow: ['turn-on'] })
        .when('on', { allow: ['turn-off'] })
        .map('turn-on', this.turnOn)
        .map('turn-off', this.turnOff)
        .stream('value', this.streamValue)
        .monitor('temp')

        var self = this
        var counter = 1
        setInterval(function() {
            self.temp = counter
            counter = (counter+1)%3
        }, 1000)

        
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

Dev.prototype.streamValue = function(stream) {
    var counter = 0
    this.on( 'request', function(req, res) {
        this.warn('start')
        stream.write(counter)
        counter = (counter+1)%3
    }, 1000 )
}
