var Promise = require('promise');
var emptyPort = Promise.denodeify(require('empty-port'));
var expect = require('chai').expect;
var fork = require('child_process').fork;

marionette('firefox host', function() {
  var client = marionette.client();

  var server, url, port;

  suiteSetup(function() {
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
    });
  });

  setup(function() {
    client.goUrl(url);
  });

  suiteTeardown(function() {
    server.kill();
    return waitForEvent(server, 'exit');
  });

  test('can read file on localhost', function() {
    var currentUrl = client.getUrl();
    expect(currentUrl).to.include(url);
    var secret = client.findElement('#secret');
    expect(secret.text()).to.equal('value');
  });
});

function waitForEvent(emitter, eventType) {
  return new Promise(function(accept) {
    emitter.on(eventType, accept);
  });
}
