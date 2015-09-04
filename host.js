/* global require, module */

'use strict';

var stream = require('stream');
var Promise = require('promise'); // jshint ignore:line

function Host() {
  this.log = new stream.PassThrough();
}
module.exports = Host;

Host.prototype = {
  destroy: function() {
    return Promise.resolve();
  }
};

Host.create = function() {
  return Promise.resolve(new Host());
};
