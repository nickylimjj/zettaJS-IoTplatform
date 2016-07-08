// discover_resources.js
var urlencode = require('urlencode')
var EnvSensor = require('./devices/envsensor')
var PwrAdpSensor = require('./devices/powersensor')

// 
var DiscoverResource = module.exports = function(scout) {
    this.scout = scout
}

DiscoverResource.prototype.init = function(config) {
    config
        .path('/devices')
        .consumes('application/x-www-form-urlencoded')
        .produces('application/json')
        .post('/create', this.create)
        .get('/', this.root)
}

DiscoverResource.prototype.root = function(env, next) {
    console.log('GET request')
    var body = {
        class: ['scout', 'envSensor-scout'],
        actions: [
        {
            name: 'create-envSensor',
            method: 'POST',
            href: env.helpers.url.current(),
            type: 'application/x-www-form-urlencoded',
            fields: [
            {
                name: 'sensorID',
                type: 'text'
            },
            {
                name: 'ts',
                type: 'text'
            },
            {
                name: 'value',
                type: 'bool'
            },
            ]
        }
        ]

    }
    env.response.statusCode = 200
    env.response.body = body
    return next(env)
}

DiscoverResource.prototype.create = function(env, next) {
    console.log('POST request')
    var self = this
    env.request.getBody(function(err, body) {
        if (err) {
            env.response.statusCode = 500
            return next(env)
        }

        //parse form-urlencoded
        var bodyObject = urlencode.parse(body.toString())
        var optsBoard = {
            sensorID: bodyObject.SensorID,
            ts: bodyObject.TS,
            value: bodyObject.value,
            num: bodyObject.num
        }
        
        var optsZWave = {
            nodeid : bodyObject.nodeid,
            name : bodyObject.name,
        }
        // Sensor IDs
        var nodes = {
            17: {
                driver: PwrAdpSensor,
                name: 'power-adapter'
            },
            19: {
                driver: EnvSensor,
                name:'env-sensor'
            }
        }
        // query for known sensorID 
        var query = self.scout.server.where( { nodeid: optsZWave.nodeid })
            if ( optsZWave.nodeid == 1 ) {
                return next(env);
            }
        self.scout.server.find(query, function(err, results) {
            console.log('results length: ', results.length)
            if (err) {
                console.log('cannot initalize device')
                     
            } else if (results.length) {
                //found in registry
                console.log('found in registry')
                self.scout.provision(results[0],
                        nodes[optsZWave.nodeid]['driver'],
                        optsZWave,
                        nodes[optsZWave.nodeid]['name'])
            } else {
                // not found
                console.log('enter to discover')
                self.scout.discover(nodes[optsZWave.nodeid]['driver'],
                        optsZWave,
                        nodes[optsZWave.nodeid]['name'])
            }
             
            env.response.statusCode = 201
            return next(env)
        })
    })
}
