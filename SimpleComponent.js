var nextComponentId = 1;

var queue = require('./global_queue');

var SimpleComponent = module.exports = Class.extend(function(_super) {

    return [

        function() {

            // render queue used to schedule redraws
            this._renderer = queue;

            // call the component initialiser to set up necessary
            // component properties
            this._initComponent(nextComponentId++);

            // build component structure
            this._root = this._buildComponent();

        },

        'methods', require('./mixin'),
        'methods', {

            getComponentRootNode: function() {
                return this._root;
            },

            // this method must be overridden to return the root DOM node for
            // this component.
            _buildComponent: function() {
                throw new Error("you must override Component::_buildComponent()");
            }

        }

    ];

});