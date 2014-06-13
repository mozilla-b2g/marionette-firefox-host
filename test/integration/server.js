var static = require('node-static');
var file = new(static.Server)(__dirname + '/fixtures/');

// shamelessly copy/pasted from node-static README.md
var server = require('http').createServer(function(request, response) {
  request.addListener('end', function() {
    //
    // Serve files!
    //
    file.serve(request, response);
  }).resume();
})

server.listen(0, function() {
  var port = server.address().port;
  process.send(['start', 'http://localhost:' + port + '/']);
});

