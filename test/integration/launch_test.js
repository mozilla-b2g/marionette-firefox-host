marionette('browse in firefox', function() {
  var assert = require('assert');
  var emptyPort = require('empty-port');

  var port;
  var url;
  suiteSetup(function(done) {
    emptyPort({ startPort: 60000 }, function(err, _port) {
      port = _port;
      url = 'http://localhost:' + port;
      done(err);
    });
  });

  // launch server process
  var serverProc;
  suiteSetup(function(done) {
    var fork = require('child_process').fork;
    serverProc = fork(__dirname + '/server.js', [], {
      env: { PORT: port }
    });

    serverProc.on('message', function(event) {
      assert.equal(event[0], 'start');
      assert.equal(event[1], port);
      done();
    });
  });

  suiteTeardown(function() {
    serverProc.kill();
  });

  var client = marionette.client();
  setup(function() {
    client.goUrl(url);
  });

  test('firefox can read from localhost', function() {
    var current = client.getUrl();
    assert.ok(
      current.indexOf(url) !== -1,
      'expected: ' + current + ' to include: ' + url
    );
  });
});
