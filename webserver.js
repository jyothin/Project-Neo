console.log("Initializing webserver")

var express = require('express');
var app = express();
app.set('port', 3000);
// respond with "Hello World!" on the homepage
app.get('/', function (req, res) {
  res.send('Hello World!');
})
// accept POST request on the homepage
app.post('/', function (req, res) {
  res.send('Got a POST request');
})
// accept PUT request at /user
app.put('/user', function (req, res) {
  res.send('Got a PUT request at /user');
})
// accept DELETE request at /user
app.delete('/user', function (req, res) {
  res.send('Got a DELETE request at /user');
})

var http = require('http');
var httpServer = http.createServer(app);
httpServer.listen(app.get('port'), function () {
    console.log("Express server listening on port %s.", httpServer.address().port);
});

