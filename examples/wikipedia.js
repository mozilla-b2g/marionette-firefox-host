marionette('wikipedia', function() {
  var client = marionette.client({
    prefs: {
      'browser.shell.checkDefaultBrowser': false,
      'browser.uitour.enabled': false
    }
  });

  var url = 'https://wikipedia.org';

  setup(function() {
    client.goUrl(url);
  });

  test('search for red panda', function(done) {
    var search = client.findElement('#searchInput');
    search.sendKeys(['red panda']);

    var submit = client.findElement('.formBtn');
    submit.click();

    setTimeout(function() {
      console.log('your example is done!');
      done();
    }, 3000);
  });
});
