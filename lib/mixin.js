var Hiro = require('./instance');

module.exports = {

	getComponentId: function() {
		return this._componentId;
	},

	getComponentRoot: function() {
		throw new Error("you must override getComponentRoot()");
	},

	_initComponent: function(componentId) {
		this._componentId = componentId;
		Hiro.componentCreated(this);
	}

};