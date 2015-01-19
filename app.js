/**
 * Created by Dan_Shappir on 1/19/15.
 */
/*eslint global-strict:0*/
'use strict';

var program = require('commander');
var http = require('http');
var express = require('express');
var debug = require('debug')('download:server');
var proxy = require('./src/proxy');

program
    .version('0.0.1')
    .option('-s, --site <url>', 'Site to proxy', '')
    .option('-p, --port <n>', 'Force app port (requires sudo on osx)', parseInt)
    .parse(process.argv);

var app = express();

/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(program.port || process.env.PROXYPORT || '3001');
console.info('santa-editor-proxy listening on port', port);
app.set('port', port);

/**
 * Create HTTP server.
 */
var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

proxy(app, program.site);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    var portNumber = parseInt(val, 10);

    if (isNaN(portNumber)) {
        // named pipe
        return val;
    }

    if (portNumber >= 0) {
        // port number
        return portNumber;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            break;
    }
    throw error;
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
