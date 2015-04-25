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
		child[N].logicalParent = null;
	});
	this._logicalChildren.splice(0, this._logicalChildren.length);
	Hiro.logCollectionChanged(this);
}

Collection.prototype.remove = function(component) {
	var ix = this._logicalChildren.indexOf(component);
	if (ix < 0) {
		throw new Error("no such child");
	}
	this._logicalChildren.splice(ix, 1);
	component[N].logicalParent = null;
	this._dirty = true;
	Hiro.logCollectionChanged(this);
}

Collection.prototype.append = function(component) {
	if (component[N].logicalParent !== null) {
		throw new Error("cannot add component as child, already has a parent");
	}
	this._logicalChildren.push(component);
	component[N].logicalParent = this._component;
	this._dirty = true;
	Hiro.logCollectionChanged(this);
}

Collection.prototype.syncImmediately = function() {

}