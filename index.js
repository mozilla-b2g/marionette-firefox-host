var Host = require('./host');
var Session = require('./session');

exports.help = {
  group: {
    title: 'Firefox Host',
    description: 'Firefox host lets you run marionette tests in desktop firefox'
  },

  arguments: {
    '--runtime': {
      help: 'path to find firefox'
    }
  }
};

exports.createHost = Host.create;
exports.createSession = Session.create;
