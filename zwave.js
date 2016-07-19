// zwave.js
// API for zwave data

var OZW = require('openzwave-shared')
var querystring = require('querystring')
var http = require('http')
var toTitleCase = require('to-title-case')
var debug = require('debug')('zwave')
//var urlencode = require('urlencode')
 
var config = require('./config')
var deviceIDs = require('./device-ids')

var zwave = module.exports = new OZW({
    Logging: false,
    ConsoleOutput: true
})

var nodes = [];

zwave.on('driver ready', function(homeid) {
    console.log('scanning homeid=0x%s...', homeid.toString(16));
});

zwave.on('driver failed', function() {
    console.log('failed to start driver');
    zwave.disconnect();
    process.exit();
});

zwave.on('node added', function(nodeid) {
    nodes[nodeid] = {
        manufacturer: '',
        manufacturerid: '',
        product: '',
        producttype: '',
        productid: '',
        type: '',
        name: '',
        loc: '',
        url: '',
        classes: {},
        ready: false
    };
    debug('node #%d added', nodeid)
    // discover it on zetta
});

zwave.on('value added', function(nodeid, comclass, value) {
    if (!nodes[nodeid]['classes'][comclass])
        nodes[nodeid]['classes'][comclass] = {};
    nodes[nodeid]['classes'][comclass][value.index] = value;
});
 
zwave.on('node ready', function(nodeid, nodeinfo) {
    if (nodes[nodeid]['ready'] === true)
        return;
    debug(nodeinfo)
    nodes[nodeid]['manufacturer'] = nodeinfo.manufacturer;
    nodes[nodeid]['manufacturerid'] = nodeinfo.manufacturerid;
    nodes[nodeid]['product'] = nodeinfo.product;
    nodes[nodeid]['producttype'] = nodeinfo.producttype;
    nodes[nodeid]['productid'] = nodeinfo.productid;
    nodes[nodeid]['type'] = nodeinfo.type;
    nodes[nodeid]['name'] = nodeinfo.name;
    nodes[nodeid]['loc'] = nodeinfo.loc;
    nodes[nodeid]['ready'] = true;


    //powerURLs = [
        //'913e2ac2-82e2-4391-9c8d-667cb1a251c9',
    //]
    //envURLs = [
        //'1751b5a8-4283-4089-9c10-83154874ca57',
    //]
    
    // assigning device url to respective nodes
    switch (nodes[nodeid]['type']) {
        case 'Binary Power Switch':
            nodes[nodeid]['url'] = deviceIDs.powerURLs.pop(0)
            break
        case 'Routing Binary Sensor':
            nodes[nodeid]['url'] = deviceIDS.envURLs.pop(0)
            break
    }

    // log Ready information 
    debug('[R]node #%d: %s, %s', nodeid,
            nodeinfo.manufacturer ? nodeinfo.manufacturer
                : 'id='+ nodeinfo.manufacturerid,
            nodeinfo.product ? nodeinfo.product
                : 'product='+ nodeinfo.productid +
                  ', type=' + nodeinfo.producttype);
    debug('[R]node #%d: name="%s", type="%s", location="%s",  url="%s"', nodeid,
            nodeinfo.name,
            nodeinfo.type,
            nodeinfo.loc,
            nodes[nodeid]['url'])
        for (comclass in nodes[nodeid]['classes']) {
            // Polling for some command classes
            switch (comclass) {
                case 37: // COMMAND_CLASS_SWITCH_BINARY
                case 38: // COMMAND_CLASS_SWITCH_MULTILEVEL
                    zwave.enablePoll(nodeid, commclass);
                    break;
            }
            var values = nodes[nodeid]['classes'][comclass];
            debug('[P]node #%d: class %d', nodeid, comclass);
            for (idx in values)
                debug('[P]node #%d: %s=%s', nodeid, values[idx]['label'], values[idx]['value'])
        }

    // sensor information
    var data = {
        nodeid: nodeid,
        type: nodeinfo.type.replace(/\s+/g, ''),
    }

    var body = querystring.stringify(data);
    debug('creating device with: ' + body)
     
    // POST to zetta server for discovery
    debug(body)
    post(body, '/devices/create')
    
});


zwave.on('scan complete', function() {
    console.log('===> scan complete, hit ^C to finish.');
     
    
});
 
zwave.on('value changed', function(nodeid, comclass, value) {
    if (nodes[nodeid]['ready']) {
        debug('node #%d: changed (comclass,label): %d:%s:%s->%s', nodeid, comclass,
                value['label'],
                nodes[nodeid]['classes'][comclass][value.index]['value'],
                value['value']);

        if ( nodes[nodeid]['classes'][comclass][value.index]['value'] === value['value'] ){

            debug('no change')
            return;
        }
        var label = value['label'].replace(/\s+/g, '')
        var action = 'update' + toTitleCase(value['label']).replace(/\s+/g,'')
        var data = {
            action: action,
            [label]: value['value']
        };

        debug("JSON data as a str: " + JSON.stringify(data));
        var body = querystring.stringify(data);
        debug("Urlencoded data as a str: " + body)
        var dest = '/servers/silverline/devices/' + nodes[nodeid]['url']
        debug('dest url: ' + dest)
        

        post(body, dest)
    }
    nodes[nodeid]['classes'][comclass][value.index] = value;
});
zwave.connect('/dev/ttyUSB0')

process.on('SIGINT', function() {
    console.log('disconnecting...');
    zwave.disconnect('/dev/ttyUSB0');
    process.exit();
});
 
/*
 * POST function to zetta API
 */ 
function post(body, path, port) {
    path = path || '/';
    body = body || '<default body>';
    var options = {
        hostname: config.hostname,
        port: port || config.port,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
    })

    req.write(body);
    req.end();
}

