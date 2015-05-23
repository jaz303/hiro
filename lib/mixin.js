module.exports = {

	getComponentRoot: function() { throw new Error("you must override getComponentRoot()"); },

	componentWillMount: function() {},
	componentWillUnmount: function() {},
	componentDidMount: function() {},
	componentDidUnmount: function() {},

	renderImmediately: function() {},

	_initComponent: function() {
		this._hiro.newComponent(this);
	}

};