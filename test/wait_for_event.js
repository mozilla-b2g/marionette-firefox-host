var Promise = require('promise');

module.exports = function waitForEvent(emitter, eventType) {
  return new Promise(function(accept) {
    emitter.on(eventType, accept);
  });
};
