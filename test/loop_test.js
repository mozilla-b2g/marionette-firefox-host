var Promise = require('promise');
var expect = require('chai').expect;
var serverHelper = require('./server_helper');

marionette('loop', function() {
  var client = marionette.client({
    prefs: {
      'browser.shell.checkDefaultBrowser': false
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

  test('clicking on hello icon', function() {
    client.setContext('chrome');
    client
      .findElement(':root')
      .findElement('#loop-button')
      .click();

    // Wait around for a bit to see what happens when we click hello.
    return sleep(2000);
  });
});

function sleep(millis) {
  return new Promise(function(resolve) {
    setTimeout(resolve, millis);
  });
}
