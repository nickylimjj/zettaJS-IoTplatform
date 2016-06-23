// index.js
var zetta = require('zetta')
//var LED = require('zetta-led-mock-driver')

var LED = require('./scout')
var app = require('./app')

zetta()
    .name('silverline')
    .use(LED)
    .use(app)
    .listen(3000, function(){
        console.log('Zetta is running on port 3000')
    })
