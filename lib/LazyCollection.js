var BaseCollection = require('./BaseCollection');

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
			this._syncChildren(this._getChildren(), garbage);
		}
	}
];

});
