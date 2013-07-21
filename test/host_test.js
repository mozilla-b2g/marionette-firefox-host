var Host = require('../lib/host'),
    Marionette = require('marionette-client'),
    assert = require('assert'),
    sinon = require('sinon');

suite('Host', function() {
  var subject;

  setup(function() {
    subject = new Host();
  });

  test('should expose metadata', function() {
    assert.notStrictEqual(subject.metadata, undefined);
  });

  suite('#restart', function() {
    // TODO(gareth)
  });

  suite('#start', function() {
    var client, driver, err, port, child, profile;

    setup(function(done) {
      subject.start(function(_err, _port, _child, _profile) {
        err = _err;
        port = _port;
        child = _child;
        profile = _profile;
        done();
      });
    });

    teardown(function(done) {
      subject.stop(done);
    });

    test('should not err', function() {
      assert.equal(err, null);
    });

    test('should find a valid port for marionette', function() {
      assert.ok(port >= Host.START_PORT);
    });

    test('should create a gecko child process', function() {
      assert.notEqual(child, null);
    });

    test('should make a profile', function() {
      assert.notEqual(profile, null);
    });

    test('should enable connecting to marionette server', function(done) {
      function onConnect(driver) {
        var client = new Marionette.Client(driver);
        client.startSession(function() {
          client.goUrl('https://mozilla.org');
          client.getUrl(function(err, url) {
            if (err) {
              throw err;
            }

            assert.notStrictEqual(url.indexOf('mozilla.org'), -1);
            done();
          });
        });
      }

      var driver = new Marionette.Drivers.Tcp({ port: port });
      driver.connect(function() {
        // This is a hack around some bug in marionette or the
        // marionette-js-client that makes the connect callback get
        // issued prematurely.
        setTimeout(onConnect.bind(null, driver), 1000);
      });
    });
  });

  suite('#stop', function() {
    setup(function(done) {
      subject.start(function(_err, _port, _child, _profile) {
        done();
      });
    });

    test('should kill childProcess', function(done) {
      subject.stop(done);
    });
  });
});
