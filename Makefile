.PHONY: default
default: lint test

.PHONY: lint
lint:
	gjslint --recurse . \
	  --disable "217,220,225" \
	  --exclude_directories "b2g,examples,firefox,node_modules"

.PHONY: test
test:
	./node_modules/.bin/mocha
