var Host = require('../lib/host'),
    Marionette = require('marionette-client'),
    assert = require('assert'),
    emptyPort = require('empty-port'),
    mozProfileBuilder = require('mozilla-profile-builder'),
    net = require('net');

suite('Host', function() {
  var subject;

  // port where marionette should be running.
  var port;
  setup(function(done) {
    emptyPort({}, function(err, _port) {
      port = port;
      done(err);
    });
  });

  // path to the current profile.
  var profile;
  setup(function(done) {
    var options = {
      prefs: {
        'marionette.defaultPrefs.enabled': true,
        'marionette.defaultPrefs.port': port
      }
    };

    mozProfileBuilder.create(options, function(err, instance) {
      profile = instance.path;
      done(err);
    });
  });

  setup(function() {
    subject = new Host();
  });

  test('Host.metadata', function() {
    assert.notStrictEqual(Host.metadata, undefined);
  });

  suite('#start', function() {
    var client, driver;

    setup(function(done) {
      subject.start(profile, {}, function(err) {
        assert.equal(err, null);
        done();
      });
    });

    teardown(function(done) {
      subject.stop(done);
    });

    test('should create a gecko child process', function() {
      assert.notEqual(subject._childProcess, null);
      var pid = subject._childProcess.pid;
      assert.ok(typeof(pid) === 'number' && pid % 1 === 0);
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

      var driver = new Marionette.Drivers.Tcp({
        port: subject._options.port
      });

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
      subject.start(profile, {}, done);
    });

    test('should kill _childProcess', function(done) {
      subject.stop(function() {
        var socket = net.connect(port);
        socket.on('error', function(err) {
          done();
        });
      });
    });
  });
});
