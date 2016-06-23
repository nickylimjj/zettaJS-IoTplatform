// app.js
// query for devices and wire up interactions between them.
// Apps are stateless and run in the context of the Zetta server.
// apps are not objects but basic Node.js modules.

module.exports = function(server) {
    //make queries as specific as possible
    var LED1Query = server.where( {type: 'led', name: 'led_1'} );
    var LED2Query = server.where( {type: 'led', name: 'led_2'} );

    // wait for things to come online and then excute callback function
    server.observe( [LED1Query, LED2Query], function(led_1, led_2) {
        console.log('all devices came online');
    })
}
