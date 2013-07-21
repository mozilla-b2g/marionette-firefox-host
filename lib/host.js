/**
 * @constructor
 * @param {Object} options optional configuration for host.
 */
function Host(options) {
}
module.exports = Host;

Host.prototype = {
  /**
   * Store for host configuration.
   * @type {Object}
   */
  metadata: null,

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
    // TODO(gareth)
  },

  /**
   * Shutdown the host.
   * @param {Function} callback called when shutdown complete.
   */
  stop: function(callback) {
    // TODO(gareth)
  }
};
