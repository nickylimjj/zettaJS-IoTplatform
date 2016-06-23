// app.js
// query for devices and wire up interactions between them.
// Apps are stateless and run in the context of the Zetta server.
// apps are not objects but basic Node.js modules.

module.exports = function(server) {
    //make queries as specific as possible
    var LED1Query = server.where( {type: 'led', name: 'led_1'} );
    var LED2Query = server.where( {type: 'led', name: 'led_2'} );
    var ScreenQuery = server.where( {type: 'screen', name: 'main-screen'} );
    var PwrAdpQuery = server.where( {type: 'power-sensor', name: 'power-adapter'} );
    var EnvQuery = server.where( {type: 'env-sensor', name: 'env-sensor'} );

    var allDevices = [
        LED1Query,
        LED2Query,
        ScreenQuery,
        PwrAdpQuery,
        EnvQuery
    ]
    // wait for things to come online and then excute callback function
    server.observe( allDevices, allOnline)
         
    function allOnline(led1, led2, mainscreen, pwradp, env) {
        console.log('all devices came online');
    }
}
