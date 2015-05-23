module.exports = Node;

function Node(id, ctx, component) {
    this.__id = id;
    this.__context = ctx;
    this.__component = component;
    this.__renderPending = false;
    this.__logicalVisible = true;
    this.__logicalParent = null;
    this.__liveIsMounted = false;
    this.__liveVisible = true;
    this.__liveParent = null;
    this.__containers = null;

    var root = component.getComponentRoot();
    root.setAttribute('data-hiro-id', id);
    root.hiroComponent = component;
}

Node.prototype.needsVisualUpdate = function() {
    return this.__renderPending || (this.__logicalVisible !== this.__liveVisible);
}

Node.prototype.destroy = function() {
    if (this.__logicalParent || this.__liveParent) {
        console.warn("component ID %d destroyed while it still had a parent", this.__id);
    }
    this._callOnContainers('destroy');
    if (this.__component.destroyComponent) {
        this.__component.destroyComponent();
    }
    // TODO: should we move component to a "dead" state?
    this.__context = null;
    this.__component = null;
    this.__containers = null; // TODO: any need to teardown containers?
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

Node.prototype._callOnContainers = function(method, arg) {
    if (this.__containers) {
        for (var i = 0, len = this.__containers.length; i < len; ++i) {
            this.__containers[i][method](arg);
        }
    }
}