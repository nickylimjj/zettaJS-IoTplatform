// app.js
// query for devices and wire up interactions between them.
// Apps are stateless and run in the context of the Zetta server.
// apps are not objects but basic Node.js modules.
// manages the registry and provisions consistent device id

var debug = require('debug')('app')
module.exports = function(server) {
    //make queries as specific as possible
    var LED1Query = server.where( {type: 'led', name: 'led_1'} );
    var LED2Query = server.where( {type: 'led', name: 'led_2'} );
    var ScreenQuery = server.where( {type: 'screen', name: 'main-screen'} );
    var PwrAdpQuery = server.where( {type: 'binarypowerswitch'} );
    var EnvQuery = server.where( {type: 'routingbinarysensor'} );
     
    // wait for things to come online and then excute callback function
    server.observe( PwrAdpQuery, function(pwradp) {
        debug('app.js found power adptr')
    })

    server.observe( EnvQuery, function(envSensor) {
        debug('app.js found env sensor')
    })

         
}
