// index.js
var zetta = require('zetta')

var scout = require('./scout')
var app = require('./app')

var port = process.env.PORT || 8000

zetta()
    .name('silverline')
    .use(scout)
    .use(app)
    .listen(port, function(){
        console.log('Zetta is running on port ' + port)
    })
