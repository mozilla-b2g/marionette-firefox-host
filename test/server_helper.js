var Promise = require('promise');
var emptyPort = Promise.denodeify(require('empty-port'));
var expect = require('chai').expect;
var fork = require('child_process').fork;
var waitForEvent = require('./wait_for_event');

var server, port, url;

exports.start = function() {
  return emptyPort({ startPort: 60000 })
  .then(function(result) {
    port = result;
    url = 'http://localhost:' + port;
    server = fork(__dirname + '/server.js', [], {
      env: { PORT: port }
    });

    return waitForEvent(server, 'message');
  })
  .then(function(message) {
    expect(message[0]).to.equal('start');
    expect(message[1]).to.equal(''+port);
    return url;
  });
};

exports.stop = function() {
  server.kill();
};
