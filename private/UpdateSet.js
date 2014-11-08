module.exports = UpdateSet;

function UpdateSet() {
    this.clear();
}

UpdateSet.prototype.clear = function() {
    this._prevIndexes = {};
    this._operations = [];
}

UpdateSet.prototype.push = function(id, op) {
    var prevIndex = this._prevIndexes[id];
    if (typeof prevIndex === 'number') {
        this._operations[prevIndex] = null;
    }
    this._prevIndexes[id] = this._operations.length;
    this._operations.push(op);
}

UpdateSet.prototype.forEach = function(fn) {
    for (var i = 0, len = this._operations.length; i < len; ++i) {
        if (this._operations[i]) {
            try {
                fn(this._operations[i]);
            } catch (e) {
                console.error("error caught while processing update operation");
                console.error(e);
            }
        }
    }
};