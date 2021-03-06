// index.js
var zetta = require('zetta')

var scout = require('./scout')
var app = require('./app')
var zwave = require('./zwave')
var debug = require('debug')('server')
var config = require('./config')

var port = process.env.PORT || 8000

zetta()
    .name('silverline')
    .use(scout)
    .use(app)
    //.link('http://adsc.herokuapp.com')
    .listen(port, function(){
        debug('Zetta is running on port ' + port)
    }, config.hostname)
