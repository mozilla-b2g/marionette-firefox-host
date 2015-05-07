var Host = require('./host');

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

exports.createHost = Host.createHost;
exports.createSession = Host.createSession;
