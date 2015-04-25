module.exports = Collection;

var Hiro = require('./instance');
var N = require('./node_key');

function Collection(component, el) {
	this._component = component;
	this._el = el;
	this._dirty = false;
	this._logicalChildren = [];
	this._liveChildren = [];
}

Collection.prototype.clear = function() {
	this._logicalChildren.forEach(function(child) {
		child[N].__logicalParent = null;
	});
	this._logicalChildren.splice(0, this._logicalChildren.length);
	Hiro.logChange(this);
}

Collection.prototype.remove = function(component) {
	var ix = this._logicalChildren.indexOf(component);
	if (ix < 0) {
		throw new Error("no such child");
	}
	this._logicalChildren.splice(ix, 1);
	component[N].__logicalParent = null;
	this._dirty = true;
	Hiro.logChange(this);
}

Collection.prototype.append = function(component) {
	if (component[N].__logicalParent !== null) {
		throw new Error("cannot add component as child, already has a parent");
	}
	this._logicalChildren.push(component);
	component[N].__logicalParent = this._component;
	this._dirty = true;
	Hiro.logChange(this);
}

Collection.prototype.syncImmediately = function() {
	
	var parentIsMounted = this._component[N].__liveIsMounted;
	var targetList = this._logicalChildren;
	var liveList = this._liveChildren;

	var tp = 0, lp = 0;

	while (tp < targetList.length && lp < liveList.length) {
	    var target = targetList[tp];
	    var live = liveList[lp];
	    if (target === live) {
	        ++tp; ++lp;
	    } else {
	    	this._el.insertBefore(
	            target.getComponentRoot(),
	            live.getComponentRoot()
	        );
	        // TODO: should probably store the record of what it was mounted against
	        // then we can check if it's actually changed.
	        target[N].__liveParent = parentComponent;
	        target[N].__liveIsMounted = parentIsMounted;
	        // TODO: this isn't quite right
	        liveList.splice(lp - 1, 0, liveNodes[target.getComponentId()]);
	        tp++;
	    }
	}

	if (tp < targetList.length) {
	    while (tp < targetList.length) {
	        var target = targetList[tp];
	        this._el.appendChild(target.getComponentRoot());
	        liveList.push(target);
	        ++tp;
	    }
	} else if (lp < liveList.length) {
	    var spliceStart = lp;
	    while (lp < liveList.length) {
	        var victim = liveList[lp];
	        // TODO: call willUnmount()
	        // TODO: need to propagate these calls to live children
	        this._el.removeChild(victim.getComponentRoot());
	        victim[N].__liveParent = null;
	        victim[N].__liveIsMounted = false;
	        // TODO: call didUnmount()
	        ++lp;
	    }
	    liveList.splice(spliceStart, liveList.length - spliceStart);
	}

	this._dirty = false;

}