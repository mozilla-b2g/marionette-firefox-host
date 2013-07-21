var Host = require('../lib/host'),
    assert = require('assert');

suite('Host', function() {
  var subject;

  setup(function() {
    subject = new Host();
  });

  test('should expose metadata', function() {
    assert.notStrictEqual(subject.metadata, undefined);
  });

  suite('#restart', function() {
    // TODO(gareth)
  });

  suite('#start', function() {
    // TODO(gareth)
  });

  suite('#stop', function() {
    // TODO(gareth)
  });
});
