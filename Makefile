SRC := \
	global_queue.js \
	mixin.js \
	queue.js \
	SimpleComponent.js \
	SimpleContainer.js

all: build/hiro-standalone.js build/hiro-standalone.min.js

clean:
	rm -rf build

build/hiro-standalone.js: standalone.js build $(SRC)
	browserify -o $@ -s hiro $<

build/hiro-standalone.min.js: build/hiro-standalone.js
	./node_modules/.bin/uglifyjs $< > $@

build:
	mkdir -p build
