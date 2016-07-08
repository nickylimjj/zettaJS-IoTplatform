// index.js
var zetta = require('zetta')

var scout = require('./scout')
var app = require('./app')

var port = process.env.PORT || 8000

zetta()
    .name('silverline')
    .use(scout)
    .use(app)
    //.link('http://adsc.herokuapp.com')
    .listen(port, function(){
        console.log('Zetta is running on port ' + port)
    })
