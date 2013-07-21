#!/usr/bin/env node

var Host = require('../index'),
    Marionette = require('marionette-client');


/**
 * Gets called when firefox child process started.
 * @param {Error} err error object.
 * @param {number} port for marionette server.
 * @param {string} runtime path to firefox binary.
 */
function onStart(err, port, child, profile) {
  if (err) {
    throw err;
  }

  console.log('Firefox started...');
  console.log('Marionette server listening on port %d...', port);
  console.log('Firefox profile at %s...', profile);

  var driver = new Marionette.Drivers.Tcp({ port: port });
  driver.connect(function() {
    // This is a hack around some bug in marionette or the
    // marionette-js-client that makes the connect callback get
    // issued prematurely.
    setTimeout(onConnect.bind(null, driver), 1000);
  });
}


/**
 * Gets called when driver is connected to marionette server.
 * @param {Marionette.Drivers.Tcp} driver connected driver.
 */
function onConnect(driver) {
  var client = new Marionette.Client(driver);
  client.startSession(function() {
    client
        .goUrl('https://wikipedia.org')
        .executeScript(function() {
          var search = document.getElementById('searchInput');
          search.value = 'red panda';
          var submit = document.getElementsByClassName('formBtn')[0];
          submit.click();
        });
  });
}


function main() {
  var host = new Host();
  host.start(onStart);
}


if (require.main === module) {
  main();
}
