module.exports = Node;

function Node(ctx, component) {
    this.__context = ctx;
    this.__component = component;
    this.__renderPending = false;
    this.__logicalVisible = true;
    this.__logicalParent = null;
    this.__liveIsMounted = false;
    this.__liveVisible = true;
    this.__liveParent = null;
    this.__containers = null;
}

Node.prototype.needsVisualUpdate = function() {
    return this.__renderPending || (this.__logicalVisible !== this.__liveVisible);
}

Node.prototype._callOnContainers = function(method, arg) {
    if (this.__containers) {
        for (var i = 0, len = this.__containers.length; i < len; ++i) {
            this.__containers[i][method](arg);
        }
    }
}

Node.prototype.willMount = function() {
    this.__component.componentWillMount();
    this._callOnContainers('willMount');
}

Node.prototype.willUnmount = function() {
    this.__component.componentWillUnmount();
    this._callOnContainers('willUnmount');
}

Node.prototype.setMounted = function(isMounted) {
    this.__liveIsMounted = isMounted;
    this._callOnContainers('setMounted', isMounted);
    if (isMounted && this.needsVisualUpdate()) {
        this.__context._enqueue(this.__component);
    }
}

Node.prototype.didMount = function() {
    this.__component.componentWillMount();
    this._callOnContainers('didMount');
}

Node.prototype.didUnmount = function() {
    this.__component.componentWillUnmount();
    this._callOnContainers('didUnmount');
}