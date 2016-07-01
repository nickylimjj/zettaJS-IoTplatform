// discover_resources.js
var urlencode = require('urlencode')
var EnvSensor = require('./devices/envsensor')

// 
var DiscoverResource = module.exports = function(scout) {
    this.scout = scout
}

DiscoverResource.prototype.init = function(config) {
    config
        .path('/env')
        .consumes('application/x-www-form-urlencoded')
        .produces('application/json')
        .post('/', this.create)
        .get('/', this.root)
}

DiscoverResource.prototype.root = function(env, next) {
    console.log('GET request to /env')
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
                type: 'text'
            },
            {
                name: 'num',
                type: 'number'
            }
            ]
        }
        ]

    }
    env.response.statusCode = 200
    env.response.body = body
    return next(env)
}

DiscoverResource.prototype.create = function(env, next) {
    console.log('POST request to /env')
    var self = this
    env.request.getBody(function(err, body) {
        if (err) {
            env.response.statusCode = 500
            return next(env)
        }

        //parse form-urlencoded
        var bodyObject = urlencode.parse(body.toString())
        var opts = {
            sensorID: bodyObject.SensorID,
            ts: bodyObject.TS,
            value: bodyObject.value,
            num: bodyObject.num
        }

        // query for known sensorID 
        var query = self.scout.server.where( { sensorID: opts.sensorID })
        self.scout.server.find(query, function(err, results) {
            if (results.length > 1) {
                //found in registry
                self.scout.provision(results[0], EnvSensor, opts, 'env-sensor')
            } else {
                // not found
                console.log('enter to discover')
                self.scout.discover(EnvSensor, opts, 'env-sensor')
            }
             
            console.log(results)
            env.response.statusCode = 201
            return next(env)
        })
    })
}
