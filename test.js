// index.js
var zetta = require('zetta')

var debug = require('debug')('server')
var LED = require('zetta-led-mock-driver')

var port = process.env.PORT || 8000

zetta()
    .name('silverline')
    //.link('http://adsc.herokuapp.com')
    .use(LED)
    .listen(8000, function(){
        debug('Zetta is running on port ' + port)
    })
