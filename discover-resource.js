// discover_resources.js
var urlencode = require('urlencode')
var EnvSensor = require('./devices/envsensor')
var PwrAdpSensor = require('./devices/powersensor')
var debug = require('debug')('discover-resource')

// 
var DiscoverResource = module.exports = function(scout) {
    this.scout = scout
}

DiscoverResource.prototype.init = function(config) {
    config
        .path('/devices')
        .consumes('application/x-www-form-urlencoded')
        //.consumes('application/json')
        .produces('application/json')
        .post('/create', this.create)
        .get('/', this.root)
}

DiscoverResource.prototype.root = function(env, next) {
    debug('GET request')
    var body = {
        class: ['scout'],
        actions: [
        {
            name: 'create-envSensor',
            method: 'POST',
            href: env.helpers.url.current(),
            type: 'application/x-www-form-urlencoded',
            //type: 'application/json',
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
    debug('POST request')
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
            type : bodyObject.type.toLowerCase(),
            name: bodyObject.name
        }
         
        // types
        var types = {
            binarypowerswitch: {
                driver: PwrAdpSensor,
                name: 'power-adapter'
            },
            routingbinarysensor: {
                driver: EnvSensor,
                name:'env-sensor'
            }
        }

             
        // query for known type
        var query = self.scout.server.where( { type: optsZWave.type})
            if ( !(optsZWave.type in types) ) {
                return next(env);
            }
        self.scout.server.find(query, function(err, results) {
            debug('results length: ', results.length)
            if (err) {
                debug('cannot initalize device')
                     
            } else if (results.length) {
                //found in registry
                debug('found in registry')
                self.scout.provision(results[0],
                        types[optsZWave.type]['driver'],
                        optsZWave,
                        types[optsZWave.type]['name'])
                env.response.statusCode = 200
            } else {
                // not found
                debug('enter to discover')
                self.scout.discover(
                        types[optsZWave.type]['driver'],
                        optsZWave,
                        types[optsZWave.type]['name'])
                env.response.statusCode = 201
            }
             
            return next(env)
        })
    })
}
