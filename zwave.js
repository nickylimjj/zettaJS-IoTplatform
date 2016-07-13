// zwave.js
// API for zwave data
var OZW = require('openzwave-shared')
var urlencode = require('urlencode')
var querystring = require('querystring')
var http = require('http')
var toTitleCase = require('to-title-case')

var zwave = new OZW({
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
    console.log('node added')
});

zwave.on('value added', function(nodeid, comclass, value) {
    if (!nodes[nodeid]['classes'][comclass])
        nodes[nodeid]['classes'][comclass] = {};
    nodes[nodeid]['classes'][comclass][value.index] = value;
});
 
zwave.on('node ready', function(nodeid, nodeinfo) {
    if (nodes[nodeid]['ready'] === true)
        return;
    nodes[nodeid]['manufacturer'] = nodeinfo.manufacturer;
    nodes[nodeid]['manufacturerid'] = nodeinfo.manufacturerid;
    nodes[nodeid]['product'] = nodeinfo.product;
    nodes[nodeid]['producttype'] = nodeinfo.producttype;
    nodes[nodeid]['productid'] = nodeinfo.productid;
    nodes[nodeid]['type'] = nodeinfo.type;
    nodes[nodeid]['name'] = nodeinfo.name;
    nodes[nodeid]['loc'] = nodeinfo.loc;
    nodes[nodeid]['ready'] = true;

    // assigning device url to respective nodes
    switch (nodeid) {
        case 17:
            nodes[nodeid]['url'] = '1ea2f54c-cf01-4db2-8d7a-67b22cc87975';
            break;
        case 19:
            nodes[nodeid]['url'] = '1751b5a8-4283-4089-9c10-83154874ca57';
            break;
    }
     
    // log Ready information 
    console.log('[R]node #%d: %s, %s', nodeid,
            nodeinfo.manufacturer ? nodeinfo.manufacturer
                : 'id='+ nodeinfo.manufacturerid,
            nodeinfo.product ? nodeinfo.product
                : 'product='+ nodeinfo.productid +
                  ', type=' + nodeinfo.producttype);
    console.log('[R]node #%d: name="%s", type="%s", location="%s"', nodeid,
            nodeinfo.name,
            nodeinfo.type,
            nodeinfo.loc)
        for (comclass in nodes[nodeid]['classes']) {
            // Polling for some command classes
            switch (comclass) {
                case 37: // COMMAND_CLASS_SWITCH_BINARY
                case 38: // COMMAND_CLASS_SWITCH_MULTILEVEL
                    zwave.enablePoll(nodeid, commclass);
                    break;
            }
            var values = nodes[nodeid]['classes'][comclass];
            console.log('[P]node #%d: class %d', nodeid, comclass);
            for (idx in values)
                console.log('[P]node #%d: %s=%s', nodeid, values[idx]['label'], values[idx]['value'])
        }

    // sensor information
    var data = {
        nodeid: nodeid,
        type: nodeinfo.type.replace(/\s+/g, ''),
    }

    var body = querystring.stringify(data);
    console.log('creating device with: ' + body)
     
    // POST to zetta server for discovery
    console.log(body)
    post(body, '/devices/create')
    
});

zwave.on('value changed', function(nodeid, comclass, value) {
    if (nodes[nodeid]['ready']) {
        console.log('node #%d: changed (comclass,label): %d:%s:%s->%s', nodeid, comclass,
                value['label'],
                nodes[nodeid]['classes'][comclass][value.index]['value'],
                value['value']);

        var label = value['label'].replace(/\s+/g, '')
        var action = 'update' + toTitleCase(value['label']).replace(/\s+/g,'')
        var data = {
            action: action,
            [label]: value['value']
        };

        console.log("JSON data as a str: " + JSON.stringify(data));
        var body = querystring.stringify(data);
        console.log("Urlencoded data as a str: " + body)
        var dest = '/servers/silverline/devices/' + nodes[nodeid]['url']
        console.log('dest url: ' + dest)
        

        post(body, dest)
    }
    nodes[nodeid]['classes'][comclass][value.index] = value;
});

zwave.on('scan complete', function() {
    console.log('===> scan complete, hit ^C to finish.');
     
    // switch on pwr-adp
    //zwave.setValue(17, 37, 1, 0, true)
    //zwave.setValue( {node_id: 17, class_id: 37, instance: 1, index: 0}, true)
    
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
        hostname: '10.0.0.4',
        port: port || 8000,
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

