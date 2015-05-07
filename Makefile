.PHONY: test
test: firefox node_modules/.bin/marionette-mocha
	./node_modules/.bin/marionette-mocha \
		--host $(shell pwd)/index.js \
		--runtime $(shell pwd)/firefox/firefox-bin \
		$(shell find test/ -name "*_test.js")

.PHONY: example
example: firefox node_modules/.bin/marionette-mocha
	./node_modules/.bin/marionette-mocha \
		--host $(shell pwd)/index.js \
		--runtime $(shell pwd)/firefox/firefox-bin \
		examples/wikipedia.js

firefox: node_modules/.bin/mozilla-download
	DEBUG=* ./node_modules/.bin/mozilla-download \
		--product firefox \
		--branch mozilla-central \
		$(shell pwd)
	touch firefox

node_modules/.bin/marionette-mocha: node_modules
node_modules/.bin/mozilla_download: node_modules
node_modules: package.json
	npm install
