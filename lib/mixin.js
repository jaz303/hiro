var Hiro = require('./instance');

var EMPTY_HINTS = { all: true };

module.exports = {

	getComponentId: function() {
		return this._componentId;
	},

	getComponentRoot: function() {
		throw new Error("you must override getComponentRoot()");
	},

	componentWillMount: function() {},
	componentWillUnmount: function() {},
	componentDidMount: function() {},
	componentDidUnmount: function() {},

	render: function(hint) {
		if (hint) {
			if (this._componentRenderHints === null) {
				this._componentRenderHints = {};
			}
			this._componentRenderHints[hint] = true;
		} else if (this._componentRenderHints) {
			this._componentRenderHints.all = true;
		}
		Hiro.renderRequested(this);
	},

	renderImmediately: function() {
		var hints = this._componentRenderHints;
		this._renderComponent(hints || EMPTY_HINTS);
		if (hints) {
			for (var k in hints) hints[k] = false;
		}
	},

	_initComponent: function(componentId) {
		this._componentId = componentId;
		this._componentRenderHints = null;
		Hiro.componentCreated(this);
	},

	_renderComponent: function(hints) {

	}

};