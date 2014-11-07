var EMPTY_HINTS = { all: true };

module.exports = {

    //
    // Stuff you need to override

    getComponentRootNode: function() {
        throw new Error("you must override getComponentRootNode()");
    },

    _render: function(hints) {
        /* override this method with custom rendering logic */
    },

    //
    // Everything else...

    isRootComponent: function() {
        return this._componentIsRoot;
    },

    isComponentMounted: function() {
        if (this._componentIsRoot) {
            return true;
        } else {
            return this._componentAttachedParent
                && this._componentAttachedParent.isComponentMounted();
        }
    },

    mountAsRootComponent: function(el) {
        if (this.isComponentMounted()) {
            throw new Error("can't attach as root component - component is already mounted");
        }
        (el || document.body).appendChild(this.getComponentRootNode());
        this._componentIsRoot = true;
    },

    render: function(hint) {
        if (hint) {
            if (this._componentRenderHints === null) {
                this._componentRenderHints = {};
            }
            this._componentRenderHints[hint] = true;
        } else if (this._componentRenderHints) {
            this._componentRenderHints.all = true;
        }
        this._renderer.renderComponent(this);
    },

    renderImmediately: function() {
        var hints = this._componentRenderHints;
        this._render(hints || EMPTY_HINTS);
        if (hints) {
            for (var k in hints) hints[k] = false;
        }
    },

    componentWillMount: function() { this._callOnChildComponents('componentWillMount'); },
    componentDidMount: function() { this._callOnChildComponents('componentDidMount'); },
    componentWillUnmount: function() { this._callOnChildComponents('componentWillUnmount'); },
    componentDidUnmount: function() { this._callOnChildComponents('componentDidUnmount'); },

    _attachChildComponentViaElement: function(component, el) {
        this._renderer.attachComponentViaElement(this, component, el);
    },

    _attachChildComponentByReplacingElement: function(component, el) {
        this._renderer.attachComponentByReplacingElement(this, component, el);
    },

    _detachChildComponent: function(component) {
        this._renderer.detachComponentViaElement(this, component);
    },

    _initComponent: function(componentId) {
        this._componentIsRoot = false;
        this._componentRenderHints = null;
        this._componentId = componentId;
        this._componentAttachedParent = null;
        this._componentAttachedChildren = null;
    },

    _callOnChildComponents: function(method) {
        if (this._componentAttachedChildren) {
            this._componentAttachedChildren.forEach(function(child) {
                child[method]();
            });
        }
    }

};