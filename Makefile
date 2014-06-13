MARIONETTE_MOCHA?=./node_modules/.bin/marionette-mocha \
		--host $(PWD)

.PHONY: default
default: node_modules test

firefox:
	./node_modules/.bin/mozilla-download --product firefox --branch nightly --channel prerelease  $@

node_modules:
	npm install

.PHONY: test
test: firefox test-unit test-integration

.PHONY: test-integration
test-integration:
	$(MARIONETTE_MOCHA) $(shell find test/integration -name '*_test.js')

.PHONY: test-unit
test-unit:
	./node_modules/.bin/mocha test/ $(shell find test -name '*_test.js' -d 1)

.PHONY: examples
examples:
	$(MARIONETTE_MOCHA) ./examples/wikipedia.js

