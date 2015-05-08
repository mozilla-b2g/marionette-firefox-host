var Promise = require('promise');
var debug = require('debug')('marionette-firefox-host');
var run = Promise.denodeify(require('mozilla-runner').run);

/**
 * Options:
 *
 *   (string) runtime path to runtime
 */
function Host(options) {
  for (var key in options) {
    this[key] = options[key];
  }
}
module.exports = Host;

Host.prototype = {
  destroy: function() {
    return Promise.resolve();
  }
};

Host.createHost = function() {
  return Promise.resolve(new Host());
};

Host.createSession = function(host, profile, options) {
  options = options || {};
  var target = options.runtime || this.runtime || 'firefox';
  options.profile = profile;
  debug('Will run', target, options);
  return run(target, options).then(function(child) {
    // Firefox explodes if you don't wait a bit before trying to interact
    // with the marionette server for some reason...
    return sleep(2000).then(function() {
      return new Session(child);
    });
  });
};

function Session(proc) {
  this.proc = proc;
}

Session.prototype = {
  $rpc: { methods: ['destroy'] },

  destroy: function() {
    var proc = this.proc;
    proc.kill();

    return new Promise(function(resolve, reject) {
      proc.on('error', function(error) {
        proc.removeListener('exit', resolve);
        reject(error);
      });

      proc.on('exit', resolve);
    });
  }
};

function sleep(millis) {
  return new Promise(function(accept) {
    setTimeout(accept, millis);
  });
}
