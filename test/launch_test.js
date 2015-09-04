var expect = require('chai').expect;
var serverHelper = require('./server_helper');

marionette('basic', function() {
  var client = marionette.client({
    profile: {
      prefs: {
        'browser.shell.checkDefaultBrowser': false
      }
    }
  });

  var url;

  suiteSetup(function() {
    return serverHelper.start().then(function(result) {
      url = result;
    });
  });

  setup(function() {
    client.goUrl(url);
  });

  suiteTeardown(function() {
    return serverHelper.stop();
  });

  test('can read file on localhost', function() {
    var currentUrl = client.getUrl();
    expect(currentUrl).to.include(url);
    var secret = client.findElement('#secret');
    expect(secret.text()).to.equal('value');
  });
});
