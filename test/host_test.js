var Host = require('../lib/host'),
    Marionette = require('marionette-client'),
    assert = require('assert'),
    net = require('net'),
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
    setup(function(done) {
      subject.start(function(err) {
        done();
      });
    });

    test('should kill the old one and spawn a new one', function(done) {
      var stop = sinon.spy(subject, 'stop');
      var start = sinon.spy(subject, 'start');
      subject.restart(function() {
        sinon.assert.calledOnce(stop);
        subject.stop.restore();
        sinon.assert.calledOnce(start);
        subject.start.restore();
        done();
      });
    });
  });

  suite('#start', function() {
    var client, driver;

    setup(function(done) {
      subject.start(function(err) {
        assert.equal(err, null);
        done();
      });
    });

    teardown(function(done) {
      subject.stop(done);
    });

    test('should find a valid port for marionette', function() {
      assert.ok(subject._options.port >= Host.START_PORT);
    });

    test('should create a gecko child process', function() {
      assert.notEqual(subject._childProcess, null);
      var pid = subject._childProcess.pid;
      assert.ok(typeof(pid) === 'number' && pid % 1 === 0);
    });

    test('should make a profile', function() {
      assert.notEqual(subject._options.profile, null);
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
    var port, profile;

    setup(function(done) {
      subject.start(function(err) {
        port = subject._options.port;
        profile = subject._options.profile;
        assert.equal(err, null);
        done();
      });
    });

    test('should kill _childProcess', function(done) {
      subject.stop(function() {
        var socket = net.connect(port);
        socket.on('error', function(err) {
          assert.strictEqual(err.code, 'ECONNREFUSED');
          done();
        });
      });
    });
  });
});
