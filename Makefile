SRC := $(shell browserify --list standalone.js)

all: build/hiro-standalone.js build/hiro-standalone.min.js

clean:
	rm -rf build

build/hiro-standalone.js: standalone.js build $(SRC)
	browserify -o $@ -s hiro $<

build/hiro-standalone.min.js: build/hiro-standalone.js
	./node_modules/.bin/uglifyjs $< > $@

build:
	mkdir -p build
