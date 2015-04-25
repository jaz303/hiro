var Hiro = module.exports = {};

var IDLE		= 1,
	HIERARCHY	= 2,
	RENDER 		= 3,
	AFTER 		= 4;

var Collection = require('./Collection');
var Mountpoint = require('./Mountpoint');
var N = require('./node_key');
var raf = require('./raf');

var rootComponent 	= null;
var rootCollection	= null;

var phase 			= IDLE;
var changes 		= [];
var renders 		= [];
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

Hiro.renderRequested = function(component) {
	if (phase === RENDER) {
		// TODO: this should really just be pushed onto a list
		// of pending ops so it can be picked up at the other
		// end. This works fine for now though.
		component.renderImmediately();
	} else {
		if (renders.indexOf(component) < 0) {
			renders.push(component);
			scheduleSync();
		}	
	}
	
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

	phase = HIERARCHY;
	
	if (changes.length) {
		changes.forEach(function(changed) {
			changed.syncImmediately();
		});
		changes = [];	
	}

	phase = RENDER;

	if (renders.length) {
		renders.forEach(function(component) {
			
			component.renderImmediately();	

			// TODO: come back to this... the collections currently aren't
			// propagating changes to the mount state...
			// if (component[N].__liveIsMounted) {
			// 	component.renderImmediately();	
			// } else {
			// 	// TODO: should we put this into some deferred list?
			// 	// or mark the fact render is pending?
			// }

		});
		renders = [];
	}

	phase = AFTER;
	
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

	phase = IDLE;

}