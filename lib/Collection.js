var BaseCollection = require('./BaseCollection');
var N = require('./node_key');

var Collection
	= module.exports
	= BaseCollection.extend(function(_super) {

return [
	function(ctx, component, el) {
		_super.constructor.call(this, ctx, component, el);
		this._logicalChildren = [];
	},
	'methods', {
		_logicalChildren: null,

		indexOf: function(component) {
			return this._logicalChildren.indexOf(component);
		},
		componentAtIndex: function(ix) {
			if (ix < 0 || ix >= this._logicalChildren.length) {
				throw new Error("invalid component index: ", ix);
			}
			return this._logicalChildren[ix];
		},
		clear: function() {
			console.warn("Collection::clear() is deprecated");
			this._logicalChildren.forEach(function(child) {
				child[N].__logicalParent = null;
			});
			this._logicalChildren.splice(0, this._logicalChildren.length);
			this.context.logChange(this);
		},
		remove: function(component) {
			var ix = this._logicalChildren.indexOf(component);
			if (ix < 0) throw new Error("no such child");
			this._logicalChildren.splice(ix, 1);
			component[N].__logicalParent = null;
			this.dirty = true;
			this.context.logChange(this);
		},
		append: function(component) {
			if (component[N].__logicalParent !== null) {
				throw new Error("cannot add component as child, already has a parent");
			}
			this._logicalChildren.push(component);
			component[N].__logicalParent = this._component;
			this.dirty = true;
			this.context.logChange(this);
		},
		syncImmediately: function(garbage) {
			this._syncChildren(this._logicalChildren, function(component) {
				// Collection will only GC components which haven't been
				// attached elsewhere.
				if (!component[N].__logicalParent) {
				    garbage.push(component);
				}
			});
		}
	}
];

});
