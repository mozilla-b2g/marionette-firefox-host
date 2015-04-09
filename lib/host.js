var emptyPort = require('empty-port'),
    fs = require('fs'),
    path = require('path'),
    mozProfileBuilder = require('mozilla-profile-builder'),
    mozRunner = require('mozilla-runner'),
    remove = require('remove');


/**
 * @constructor
 * @param {Object} options optional configuration for host. For instance,
 *     {
 *       'runtime': ...,  // path to find or download firefox
 *       'version': ...,  // see firefox-get
 *     }.
 */
function Host(options) {
  var runtime;
  if (options) {
    if (options.runtime) {
      runtime = options.runtime;
    } else if (options.customRuntime) {
      runtime = options.customRuntime;
    }
  }

  if (!runtime) {
    throw new Error('marionette-firefox-host needs a runtime arg');
  }

  this._options = options;
  this._options.runtime = runtime;
}
module.exports = Host;

/**
 * Which port to start on when conducting increasing port scan.
 * @const {number}
 */
Host.START_PORT = 60030;

/**
 * Immutable store for host configuration.
 * @type {Object}
 */
Host.metadata = Object.freeze({ host: 'firefox' });


Host.prototype = {
  /**
   * Firefox child process.
   * @type {ChildProcess}
   */
  _childProcess: null,

  /**
   * Store for gecko configuration.
   * @type {Object}
   */
  _options: null,

  /**
   * Start the host.
   *
   * @param {String} profile path.
   * @param {Object} options for profile.
   * @param {Function} callback called when startup complete.
   */
  start: function(profile, options, callback) {
    var onChild = (function(err, child) {
      this._childProcess = child;
      // Because firefox will explode while trying to start marionette.
      setTimeout(function() {
        callback && callback(err);
      }, 2000);
    }).bind(this);

    // HACK!!
    var runtime = this._options.runtime[0] === '/' ?
      this._options.runtime :
      __dirname + '/' + this._options.runtime;
    mozRunner.run(runtime, {
      argv: ['-marionette'],
      profile: profile,
      product: 'firefox'
    }, onChild);
  },

  /**
   * Shutdown the host.
   * @param {Function} callback called when shutdown complete.
   */
  stop: function(callback) {
    if (!this._childProcess) {
      // callback should always be async even if we know we are done.
      process.nextTick(callback);
      return;
    }

    var onExit = (function(err) {
      this._childProcess = null;
      callback(err);
    }.bind(this));

    this._childProcess.once('exit', onExit);
    this._childProcess.kill();
  }
};
