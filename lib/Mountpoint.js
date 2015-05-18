module.exports = Mountpoint;

var N = require('./node_key');

function Mountpoint(ctx, component, el) {
	this.context = ctx;
	this.component = component;
	this.el = el;
	this._parent = el.parentNode;
	this._logicalChild = null;
	this._liveChild = null;

	if (!this._parent) {
		throw new Error("could not determine parent node for mountpoint");
	}
}

Mountpoint.prototype.getComponent = function() {
	return this._logicalChild;
}

Mountpoint.prototype.removeComponent = function() {
	if (this._logicalChild === null) {
		throw new Error("no such child");
	}
	this._logicalChild[N].__logicalParent = null;
	this._logicalChild = null;
	this.context.logChange(this);
}

Mountpoint.prototype.setComponent = function(component) {
	if (component === null) {
		this.removeComponent();
	} else {
		if (component[N].__logicalParent !== null) {
			throw new Error("cannot add component as child, already has a parent");
		}
		this._logicalChild = component;
		component[N].__logicalParent = this.component;
		this.context.logChange(this);
	}
}

Mountpoint.prototype.syncImmediately = function() {
	if (this._logicalChild !== this._liveChild) {

		var parentIsMounted = this.component[N].__liveIsMounted;
		var incoming = this._logicalChild;
		var outgoing = this._liveChild;

		// if (parentIsMounted) {
		// 	if (this._logicalChild && !this._logicalChild[N].__liveIsMounted) {
		// 		// propagate willMount
		// 	}
		// 	if (this._liveChild) {
		// 		// propagate willUnmount
		// 	}
		// }

		this._parent.replaceChild(
			incoming ? incoming.getComponentRoot() : this.el,
			outgoing ? outgoing.getComponentRoot() : this.el
		);

		this._liveChild = incoming;
		
		if (incoming) {
			incoming[N].__liveParent = this.component;
			incoming[N].setMounted(parentIsMounted);
		}
		
		if (outgoing) {
			outgoing[N].__liveParent = null;
			outgoing[N].setMounted(false);
		}

		// if (parentIsMounted) {
		// 	if ()
		// }

	}
}

Mountpoint.prototype.willMount = function() {
	this._liveChild && this._liveChild[N].willMount();
}

Mountpoint.prototype.willUnmount = function() {
	this._liveChild && this._liveChild[N].willUnmount();
}

Mountpoint.prototype.setMounted = function(isMounted) {
	this._liveChild && this._liveChild[N].setMounted(isMounted);
}

Mountpoint.prototype.didMount = function() {
	this._liveChild && this._liveChild[N].didMount();
}

Mountpoint.prototype.didUnmount = function() {
	this._liveChild && this._liveChild[N].didUnmount();
}
