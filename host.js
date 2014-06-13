var fsPath = require('path'),
    fs = require('fs'),
    mozrunner = require('mozilla-runner'),
    debug = require('debug')('marionette-b2g-host'),
    debugChild = require('debug')('firefox');

var DEFAULT_LOCATION = fsPath.join(process.cwd(), 'firefox');

/**
 * Handles piping process details to debug.
 * @param {ChildProcess} process to watch.
 * @private
 */
function debugProcess(process) {
  function watchStream(type, stream) {
    stream.on('data', function(buffer) {
      debugChild(type, buffer.toString());
    });
  }

  watchStream('stdout', process.stdout);
  watchStream('stderr', process.stderr);
}

/**
 * Host interface for marionette-js-runner.
 *
 * TODO: I think this API is much more sane then the original
 *       |spawn| interface but we also need to do some refactoring
 *       in the mozilla-profile-builder project to improve the apis.
 *
 * @param {Object} [options] for host see spawn for now.
 */
function Host(options) {
  this.options = options || {};
  this.options.runtime = this.options.runtime || DEFAULT_LOCATION;
}

/**
 * Immutable metadata describing this host.
 *
 * @type {Object}
 */
Host.metadata = Object.freeze({
  host: 'firefox'
});

Host.prototype = {
  /**
   * Reference to b2g-desktop process.
   *
   * @type {ChildProcess}
   * @private
   */
  _process: null,

  /**
   * Starts the b2g-desktop process.
   *
   * @param {String} profile path.
   * @param {Object} [options] settings provided by caller.
   * @param {Function} callback [Error err].
   */
  start: function(profile, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = null;
    }

    var userOptions = {};

    for (var key in options) {
      userOptions[key] = options[key];
    }
    userOptions.profile = userOptions.profile || profile;
    userOptions.product = userOptions.product || 'firefox';

    debug('start');
    var self = this;
    var target = userOptions.runtime || self.options.runtime;

    function run() {
      debug('binary: ', target);
      debug('profile: ', profile);
      mozrunner.run(
        target,
        userOptions,
        saveState
      );
    }

    function saveState(err, process) {
      if (err) return callback(err);
      debugProcess(process);
      self._process = process;
      callback();
    }

    run();
  },

  /**
   * Stop the currently running host.
   *
   * @param {Function} callback [Error err].
   */
  stop: function(callback) {
    debug('stop');
    if (this._process) {
      this._process.on('exit', callback);
      this._process.kill();
    }
  }
};

module.exports = Host;

