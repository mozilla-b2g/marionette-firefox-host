.PHONY: test
test: test-unit test-integration

firefox: node_modules
	DEBUG=* ./node_modules/.bin/mozilla-download \
		--product firefox \
		--branch mozilla-central \
		$(shell pwd)

.PHONY: test-unit
test-unit: firefox node_modules
	./node_modules/.bin/mocha ./test/host_test.js

.PHONY: test-integration
test-integration: firefox node_modules
	./node_modules/.bin/marionette-mocha $(shell find test/integration -name "*_test.js")

.PHONY: examples
examples: firefox node_modules
	./node_modules/.bin/marionette-mocha \
		--host ./index.js \
		./examples/wikipedia.js

node_modules: package.json
	npm install

.PHONY: clean
clean:
	rm -rf firefox node_modules
