var emptyPort = require('empty-port'),
    fs = require('fs'),
    path = require('path'),
    mozDownload = require('mozilla-download'),
    mozProfileBuilder = require('mozilla-profile-builder'),
    mozRunner = require('mozilla-runner'),
    remove = require('remove');


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
  this._options = options || {};
}
module.exports = Host;

/**
 * Immutable metadata describing this host.
 *
 * @type {Object}
 */
Host.metadata = Object.freeze({
  host: 'firefox'
});

/**
 * Where to store and find a downloaded firefox.
 * @const {string}
 */
Host.DEFAULT_FIREFOX_RUNTIME = (function() {

  var locations = [
    [path.sep, 'Applications', 'FirefoxNightly.app'],
    [path.sep, 'Applications', 'Firefox.app'],
    [path.sep, 'usr', 'bin', 'firefox'],
    [process.cwd(), 'firefox']
  ];

  for (var i = 0, iLen = locations.length; i < iLen; i++) {
    var location = path.join.apply(path, locations[i]);
    var exists = fs.existsSync(location);

    if (exists || i + 1 == iLen) {
      console.log('Using firefox location: ' + location);
      return location;
    }
  }
}());


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
   * Store for host configuration.
   * @type {Object}
   */
  metadata: Object.freeze({
    host: 'firefox'
  }),

  /**
   * Firefox child process.
   * @type {ChildProcess}
   */
  _childProcess: null,

  /**
   * Whether or not the user specified a custom profile.
   * @type {boolean}
   */
  _customProfile: false,

  /**
   * Store for gecko configuration.
   * @type {Object}
   */
  _options: null,

  /**
   * Restart the host.
   * @param {Function} callback called when host starts up again.
   */
  restart: function(callback) {
    // In case someone calls restart without a child process.
    if (!this._childProcess) {
      return this.start(callback);
    }

    this.stop((function() {
      this.start(callback);
    }).bind(this));
  },

  /**
   * Start the host.
   * @param {Function} callback called when startup complete.
   */
  start: function(profile, options, callback) {

    if (typeof options === 'function') {
      callback = options;
      options = null;
    } else if (typeof profile === 'function') {
      callback = profile;
      options = null;
    }

    if (!this._options.runtime) {
      this._options.runtime = Host.DEFAULT_FIREFOX_RUNTIME;
    }

    var self = this;

    // First download firefox.
    this._maybeDownloadFirefox(function() {
      // Then get a port to connect to the marionette server.
      self._getPort(function(err, port) {
        if (err) {
          throw err;
        }

        self._options.port = port;

        // Then build a profile if we weren't supplied one.
        self._maybeBuildProfile(function(err, profile) {
          if (err) {
            throw err;
          }

          self._options.profile = profile;

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
    var onExit = (function(err) {
      if (err) {
        throw err;
      }

      this._childProcess = null;

      if (this._customProfile) {
        return callback();
      }

      remove(this._options.profile, callback);
    }).bind(this);

    this._childProcess.once('exit', onExit);
    this._childProcess.kill();
  },

  /**
   * Get a port to connect to the marionette server.
   */
  _getPort: function(callback) {
    if (this._options.port || this._options.profile) {
      return callback();
    }

    emptyPort({ startPort: Host.START_PORT }, callback);
  },

  /**
   * Build firefox profile with marionette turned on if necessary.
   */
  _maybeBuildProfile: function(callback) {
    if (this._options.profile) {
      this._customProfile = true;
      return callback();
    }

    // Configure profile.
    if (!this._options.prefs) {
      this._options.prefs = {};
    }

    this._options.prefs['marionette.defaultPrefs.enabled'] = true;
    this._options.prefs['marionette.defaultPrefs.port'] = this._options.port;

    mozProfileBuilder['firefox'].profile(this._options, callback);
  },

  /**
   * Download firefox if necessary.
   */
  _maybeDownloadFirefox: function(callback) {
    var onExists = (function(exists) {
      if (exists) {
        return callback();
      }

      if (!this._options.version) {
        this._options.version = Host.DEFAULT_FIREFOX_VERSION;
      }

      // Download firefox.
      mozDownload.download('firefox', this._options.runtime, {
        version: this._options.version
      }, callback);
    }).bind(this);

    fs.exists(this._options.runtime, onExists);
  },

  /**
   * Start firefox in a child process.
   */
  _run: function(callback) {
    var onChild = (function(err, child) {
      this._childProcess = child;
      callback && callback(err);
    }).bind(this);

    mozRunner.run('firefox', this._options.runtime, {
      argv: ['-marionette'],
      profile: this._options.profile
    }, onChild);
  }
};
