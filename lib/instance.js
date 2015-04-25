var Hiro = module.exports = {};

var Collection = require('./Collection');
var Mountpoint = require('./Mountpoint');
var N = require('./node_key');
var raf = require('./raf');

var rootComponent 	= null;
var rootCollection	= null;

var changes 		= [];
var syncTimeout 	= null;
var afterUpdate 	= [];

Hiro.init = function() {

	var ROOT_COMPONENT_ID = '__root__' + Math.random();

	rootComponent = {
		getComponentId: function() { return ROOT_COMPONENT_ID; },
		getComponentRoot: function() { return document.body; }
	};

	rootComponent[N] = new Node(rootComponent);
	rootComponent[N].__liveIsMounted = true;
	rootCollection = new Collection(rootComponent, document.body);

}

Hiro.append = function(component) {
	rootCollection.append(component);
}

Hiro.clear = function() {
	rootCollection.clear();
}

Hiro.remove = function(component) {
	rootCollection.remove(component);
}

Hiro.componentCreated = function(component) {
	component[N] = new Node(component);
}

Hiro.logChange = function(thing) {
	if (changes.indexOf(thing) < 0) {
		changes.push(thing);
		scheduleSync();
	}
}

Hiro.addCollection = function(component, el) {
	// TODO: stash this on component[N] somewhere?
	return new Collection(component, el);
}

Hiro.addMountpoint = function(component, el) {
	// TODO: stash this on component[N] somewhere?
	return new Mountpoint(component, el);
}

//
//

function Node(component) {
	this.__component = component;
	this.__logicalParent = null;
	this.__liveParent = null;
	this.__liveIsMounted = false;
}

function scheduleSync() {
	if (!syncTimeout) {
		syncTimeout = raf(syncImmediately);
	}
}

function syncImmediately() {
	
	syncTimeout = null;
	
	changes.forEach(function(changed) {
		changed.syncImmediately();
	});
	changes = [];

	if (afterUpdate.length) {
	    var nowAfter = after;
	    after = [];
	    nowAfter.forEach(function(cb) {
	        try {
	            cb();
	        } catch (e) {
	            console.error(e);
	        }
	    });
	}

}