var nextComponentId = 1;

var Class = require('classkit').Class;
var Hiro = require('./instance');

var SimpleComponent = module.exports = Class.extend(function(_super) {

    return [

        function() {

            // call the component initialiser to set up necessary
            // component properties
            this._initComponent(nextComponentId++);

            // build component structure
            this._root = this._buildComponent();

        },

        'methods', require('./mixin'),
        'methods', {

            getComponentRoot: function() {
                return this._root;
            },

            // this method must be overridden to return the root DOM node for
            // this component.
            _buildComponent: function() {
                throw new Error("you must override _buildComponent()");
            }

        }

    ];

});