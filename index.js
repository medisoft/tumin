var app = require('./app');
var server = require('http').Server(app);
var io = require('socket.io')(server);
require('dotenv').load();


console.log('Listening at port ',process.env.PORT || 18000);
server.listen(process.env.PORT || 18000);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
