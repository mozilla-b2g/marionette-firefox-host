/* global require, module */

'use strict';

var Promise = require('promise'); // jshint ignore:line
var debug = require('debug')('marionette-firefox-host');
var run = Promise.denodeify(require('mozilla-runner').run);

function Session(proc) {
  this.proc = proc;
}
module.exports = Session;

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

Session.create = function(host, profile, options) {
  options = options || {};
  var target = options.runtime || 'firefox';
  options.profile = profile;
  debug('Will run', target, options);
  return run(target, options).then(function(child) {
    child.stdout.pipe(host.log, { end: false });
    // Firefox explodes if you don't wait a bit before trying to interact
    // with the marionette server for some reason...
    return sleep(4000).then(function() {
      return new Session(child);
    });
  });
};

function sleep(millis) {
  return new Promise(function(resolve) {
    setTimeout(resolve, millis);
  });
}
