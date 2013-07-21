var emptyPort = require('empty-port'),
    fs = require('fs'),
    path = require('path'),
    mozDownload = require('mozilla-download'),
    mozProfileBuilder = require('mozilla-profile-builder'),
    mozRunner = require('mozilla-runner');


/**
 * @constructor
 * @param {Object} options optional configuration for host. For instance,
 *     {
 *       'prefs': ...,    // prefs for runtime
 *       'profile' ...,   // set firefox profile
 *       'port': ...,     // use this port
 *       'runtime': ...,  // path to find or download firefox
 *       'settings' ...,  // data to inject into settings db
 *       'version': ...,  // see firefox-get
 *     }.
 */
function Host(options) {
  this.options = options || {};
}
module.exports = Host;


/**
 * Where to store and find a downloaded firefox.
 * @const {string}
 */
Host.DEFAULT_FIREFOX_RUNTIME = path.join(process.cwd(), 'firefox');


/**
 * Default version of firefox to use.
 * @const {string}
 */
Host.DEFAULT_FIREFOX_VERSION = 'nightly';


/**
 * Which port to start on when conducting increasing port scan.
 * @const {number}
 */
Host.START_PORT = 60030;


Host.prototype = {
  /**
   * Firefox child process.
   */
  childProcess: null,

  /**
   * Store for host configuration.
   * @type {Object}
   */
  metadata: {
    host: 'firefox'
  },

  /**
   * Store for gecko configuration.
   * @type {Object}
   */
  options: null,

  /**
   * Restart the host.
   * @param {Function} callback called when host starts up again.
   */
  restart: function(callback) {
    // TODO(gareth)
  },

  /**
   * Start the host.
   * @param {Function} callback called when startup complete.
   */
  start: function(callback) {
    if (!this.options.runtime) {
      this.options.runtime = Host.DEFAULT_FIREFOX_RUNTIME;
    }

    var self = this;

    // First download firefox.
    this._maybeDownloadFirefox(function() {
      // Then get a port to connect to the marionette server.
      self._getPort(function(err, port) {
        if (err) {
          throw err;
        }

        self.options.port = port;

        // Then build a profile if we weren't supplied one.
        self._maybeBuildProfile(function(err, profile) {
          if (err) {
            throw err;
          }

          self.options.profile = profile;

          // Then run firefox.
          self._run(callback);
        });
      });
    });
  },

  /**
   * Shutdown the host.
   * @param {Function} callback called when shutdown complete.
   */
  stop: function(callback) {
    this.childProcess.once('exit', callback);
    this.childProcess.kill();
  },

  /**
   * Get a port to connect to the marionette server.
   */
  _getPort: function(callback) {
    if (this.options.port || this.options.profile) {
      return callback();
    }

    emptyPort({ startPort: Host.START_PORT }, callback);
  },

  /**
   * Build firefox profile with marionette turned on if necessary.
   */
  _maybeBuildProfile: function(callback) {
    if (this.options.profile) {
      return callback();
    }

    // Configure profile.
    if (!this.options.prefs) {
      this.options.prefs = {};
    }

    this.options.prefs['marionette.defaultPrefs.enabled'] = true;
    this.options.prefs['marionette.defaultPrefs.port'] = this.options.port;

    mozProfileBuilder['firefox'].profile(this.options, callback);
  },

  /**
   * Download firefox if necessary.
   */
  _maybeDownloadFirefox: function(callback) {
    var onExists = (function(exists) {
      if (exists) {
        return callback();
      }

      if (!this.options.version) {
        this.options.version = Host.DEFAULT_FIREFOX_VERSION;
      }

      // Download firefox.
      mozDownload.download('firefox', this.options.runtime, {
        version: this.options.version
      }, callback);
    }).bind(this);

    fs.exists(this.options.runtime, onExists);
  },

  /**
   * Start firefox in a child process.
   */
  _run: function(callback) {
    var onChild = (function(err, child) {
      this.childProcess = child;
      callback && callback(
        err, this.options.port, child, this.options.profile);
    }).bind(this);

    mozRunner.run('firefox', this.options.runtime, {
      argv: ['-marionette'],
      profile: this.options.profile
    }, onChild);
  }
};
