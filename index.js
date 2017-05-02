#! /usr/bin/env node
var userArgs = process.argv.slice(2);
var searchParam = userArgs[0];

var app = require('./app');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var _ = require('lodash');
var TX = require('./modules/tx'),
    Fabric = require('./modules/fabric'),
    types = require('./modules/types');
require('dotenv').load();
var fabric = new Fabric();

if (_.indexOf(userArgs, '--start-genesis') >= 0) {
    console.log('Creating new genesis transaction');
    fabric.attach(new TX());
}

setInterval(function() { fabric.generateSPAM()}, types.TimePerBlock);
// fabric.generateSPAM();

console.log('Listening at port ', process.env.PORT || 18000);
server.listen(process.env.PORT || 18000);

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    socket.emit('news', {hello: 'world'});
    socket.on('my other event', function (data) {
        console.log(data);
    });
});
