MARIONETTE_MOCHA?=./node_modules/.bin/marionette-mocha \
		--host $(PWD)/index.js

.PHONY: default
default: node_modules lint test

firefox:
	./node_modules/.bin/mozilla-download --product firefox --verbose $@

node_modules:
	npm install

.PHONY: lint
lint:
	gjslint --recurse . \
	  --disable "217,220,225" \
	  --exclude_directories "b2g,examples,firefox,node_modules"

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

