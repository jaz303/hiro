module.exports = Mountpoint;

var Hiro = require('./instance');
var N = require('./node_key');

function Mountpoint(component, el) {
	this._component = component;
	this._el = el;
	this._parent = el.parentNode;
	this._dirty = false;
	this._logicalChild = null;
	this._liveChild = null;

	if (!this._parent) {
		throw new Error("could not determine parent node for mountpoint");
	}
}

Mountpoint.prototype.removeComponent = function() {
	if (this._logicalChild === null) {
		throw new Error("no such child");
	}
	this._logicalChild[N].__logicalParent = null;
	this._logicalChild = null;
	this._dirty = true;
	Hiro.logChange(this);
}

Mountpoint.prototype.setComponent = function(component) {
	if (component[N].__logicalParent !== null) {
		throw new Error("cannot add component as child, already has a parent");
	}
	this._logicalChild = component;
	component[N].__logicalParent = this._component;
	this._dirty = true;
	Hiro.logChange(this);
}

Mountpoint.prototype.syncImmediately = function() {
	if (!this._dirty) {
		return;
	}
	if (this._logicalChild !== this._liveChild) {
		var elementToReplace = this._liveChild
								? this._liveChild.getComponentRoot()
								: this._el;
		var elementToInsert = this._logicalChild
								? this._logicalChild.getComponentRoot()
								: this._el;
		// TODO(jwf): lifecycle methods
		this._parent.replaceChild(elementToInsert, elementToReplace);
		this._liveChild = this._logicalChild;
	}
	this._dirty = false;
}