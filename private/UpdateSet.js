function UpdateSet() {
	this.clear();
}

UpdateSet.prototype.clear = function() {
	this._lastIndexes = {};
	this._operations = [];
}

UpdateSet.prototype.push = function(id, op) {

	var prevIndex = this._prevIndexes[id];
	if (typeof prevIndex === 'number') {
		this._operations[prevIndex] = false;
	}

	this._operations.push(true, op);
}

UpdateSet.prototype.forEach = function(fn) {
	for (var i = 0, len = this._operations.length; i < len; i += 2) {
		if (op[i]) {
			try {
				fn(op[i+1]);
			} catch (e) {
				// ...?
			}
		}
	}
});