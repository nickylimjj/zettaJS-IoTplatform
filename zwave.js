// zwave.js
// API for zwave data
var OZW = require('openzwave-shared')
var urlencode = require('urlencode')
var querystring = require('querystring')
var http = require('http')

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
        name: nodeinfo.name
    }

    var body = querystring.stringify(data);
     
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

        var data = {
            action: 'updateSwitch',
            [value['label']]: value['value']
        };

        console.log("JSON data as a str: " + JSON.stringify(data));
        var body = querystring.stringify(data);
        console.log("Urlencoded data as a str: " + body)
        //POST to zetta server
        
        post(body, '/servers/silverline/devices/a7d1cfaa-2429-4890-afb1-d4260f9fec1f')
    }
    nodes[nodeid]['classes'][comclass][value.index] = value;
});

zwave.on('scan complete', function() {
    console.log('===> scan complete, hit ^C to finish.');
     
    // switch on pwr-adp
    zwave.setValue(17, 37, 1, 0, true)
    zwave.setValue( {node_id: 17, class_id: 37, instance: 1, index: 0}, true)
    
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
function post(body, path) {
    path = path || '/';
    body = body || '<default body>';
    var options = {
        hostname: '10.0.0.4',
        port: 8000,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(body) {
            console.log('Body: ' + body)
        });
    })

    req.write(body);
    req.end();
}

