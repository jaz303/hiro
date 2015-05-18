var Hiro = module.exports = {};

var IDLE		= 1,
	HIERARCHY	= 2,
	RENDER 		= 3,
	AFTER 		= 4;

var Collection = require('./Collection');
var LazyCollection = require('./LazyCollection');
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

Hiro.setComponentVisible = function(component, isVisible) {
	isVisible = !!isVisible;
	if (component[N].__logicalVisible !== isVisible) {
		component[N].__logicalVisible = isVisible;
		if (phase === RENDER) {
			performVisualUpdates(component);
		} else {
			enqueueComponentForVisualUpdates(component);	
		}
	}
}

Hiro.renderRequested = function(component) {
	component[N].__renderPending = true;
	if (phase === RENDER) {
		// TODO: this should really just be pushed onto a list
		// of pending ops so it can be picked up at the other
		// end. This works fine for now though.
		performVisualUpdates(component);
	} else {
		enqueueComponentForVisualUpdates(component);
	}
	
}

Hiro.logChange = function(thing) {
	if (changes.indexOf(thing) < 0) {
		changes.push(thing);
		scheduleSync();
	}
}

Hiro.addCollection = function(component, el) {
	var n = component[N];
	var c = new Collection(component, el);
	if (!n.__containers) n.__containers = [];
	n.__containers.push(c);
	return c;
}

Hiro.addLazyCollection = function(component, el, getChildren) {
	var n = component[N];
	var c = new LazyCollection(component, el, getChildren);
	if (!n.__containers) n.__containers = [];
	n.__containers.push(c);
	return c;
}

Hiro.addKeyedCollection = function(component, el, forEach, itemKey, componentForItem) {
	var activeComponents = {};
	return Hiro.addLazyCollection(component, el, function() {
		for (var k in activeComponents) activeComponents[k][0] = false;
		var logicalChildren = [];
		forEach(function(i) {
			var key = itemKey(i);
			var cmp = activeComponents[key];
			if (!cmp) {
				cmp = activeComponents[key] = [true, componentForItem(i)];
			} else {
				cmp[0] = true;
			}
			logicalChildren.push(cmp[1]);
		});
		for (var k in activeComponents) {
			if (!activeComponents[k][0]) delete activeComponents[k];
		}
		return logicalChildren;
	});
}

Hiro.addMountpoint = function(component, el) {
	var n = component[N];
	var m = new Mountpoint(component, el);
	if (!n.__containers) {
		n.__containers = [];
	}
	n.__containers.push(m);
	return m;
}

Hiro.afterUpdate = function(fn) {
	afterUpdate.push(fn);
}

//
//

function Node(component) {
	this.__component = component;
	this.__renderPending = false;
	this.__logicalVisible = true;
	this.__logicalParent = null;
	this.__liveParent = null;
	this.__liveIsMounted = false;
	this.__liveVisible = true;
	this.__containers = null;
}

Node.prototype._callOnContainers = function(method, arg) {
	if (this.__containers) {
		for (var i = 0, len = this.__containers.length; i < len; ++i) {
			this.__containers[i][method](arg);
		}
	}
}

Node.prototype.willMount = function() {
	this.__component.componentWillMount();
	this._callOnContainers('willMount');
}

Node.prototype.willUnmount = function() {
	this.__component.componentWillUnmount();
	this._callOnContainers('willUnmount');
}

Node.prototype.setMounted = function(isMounted) {
	this.__liveIsMounted = isMounted;
	this._callOnContainers('setMounted', isMounted);
	if (isMounted && visualUpdatesRequired(this.__component)) {
		enqueueComponentForVisualUpdates(this.__component);
	}
}

Node.prototype.didMount = function() {
	this.__component.componentWillMount();
	this._callOnContainers('didMount');
}

Node.prototype.didUnmount = function() {
	this.__component.componentWillUnmount();
	this._callOnContainers('didUnmount');
}

//
//

function enqueueComponentForVisualUpdates(component) {
	if (renders.indexOf(component) < 0) {
		renders.push(component);
		scheduleSync();
	}
}

function scheduleSync() {
	if (!syncTimeout) {
		syncTimeout = raf(syncImmediately);
	}
}

function visualUpdatesRequired(component) {
	var node = component[N];
	return node.__renderPending || (node.__logicalVisible !== node.__liveVisible);
}

function performVisualUpdates(component) {

	var n = component[N];

	if (!n.__liveIsMounted) {
		return;
	}

	if (n.__logicalVisible && !n.__liveVisible) {
		component.getComponentRoot().style.display = '';
		n.__liveVisible = true;
	} else if (!n.__logicalVisible && n.__liveVisible) {
		component.getComponentRoot().style.display = 'none';
		n.__liveVisible = false;
	}
	
	if (n.__liveVisible && n.__renderPending) {
		component.renderImmediately();	
		n.__renderPending = false;
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
		renders.forEach(performVisualUpdates);
		renders = [];
	}

	phase = AFTER;
	
	if (afterUpdate.length) {
	    var nowAfter = afterUpdate;
	    afterUpdate = [];
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