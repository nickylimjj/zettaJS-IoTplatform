# zettaJS IoT platform
An IoT platform that exposes an API on the web for consumption

## Installation
Ensure that your machine has Node.js and npm installed. To run the server, do
```javascript
npm install
npm test
```

## Limitations
The code is currently written to provision 1 power adapter and 1 env sensor. To scale
and allow more devices, look in `discover-resource.js` for the `create` method and modify the `device-ids.js` to include more device ids.

## Contact
Questions can be sent to <limjiaj@illnois.edu>
