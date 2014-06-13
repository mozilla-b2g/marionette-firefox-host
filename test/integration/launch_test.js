marionette('browse in firefox', function() {
  var assert = require('assert');

  var url;
  // launch server process
  var serverProc;
  suiteSetup(function(done) {
    var fork = require('child_process').fork;
    serverProc = fork(__dirname + '/server.js');

    serverProc.on('message', function(event) {
      assert.equal(event[0], 'start');
      assert.ok(event[1]);
      url = event[1];
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
