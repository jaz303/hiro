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
			this.ctx.logChange(this);
		},
		syncImmediately: function() {
			this._syncChildren(this._getChildren());
		}
	}
];

});
