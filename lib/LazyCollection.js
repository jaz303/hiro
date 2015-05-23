var BaseCollection = require('./BaseCollection');
var N = require('./node_key');

var LazyCollection
	= module.exports
	= BaseCollection.extend(function(_super) {

return [
	function(ctx, component, el, getChildren) {
		_super.constructor.call(this, ctx, component, el);
		this.dirty = true;
		this._getChildren = getChildren;
	},
	'methods', {
		_getChildren: null,

		invalidate: function() {
			this.dirty = true;
			this.context.logChange(this);
		},
		syncImmediately: function(garbage) {
			var children = this._getChildren();
			children.forEach(function(c) {
				c[N].__logicalParent = this.component;
			}, this);
			this._syncChildren(children, function(component) {
				// For now LazyCollection assumes that it "owns" any components
				// so any culled component is eligible for garbage collection
				component[N].__logicalParent = null;
				garbage.push(component);
			});
		}
	}
];

});
