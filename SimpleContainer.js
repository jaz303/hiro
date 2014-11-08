var SimpleComponent = require('./SimpleComponent');

var SimpleContainer = module.exports = SimpleComponent.extend(function(_super) {

    return [

        function() {
            _super.constructor.call(this);
        },

        'methods', {
            getContainerRootNode: function() {
                return this._root;
            },

            addChildComponent: function(component) {
                this._attachChildComponentViaElement(component, this.getContainerRootNode());
            },

            removeChildComponent: function(component) {
                this._detachChildComponent(component, this.getContainerRootNode());
            }
        }

    ];

});