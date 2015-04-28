var Class = require('classkit').Class;
var Hiro = require('./instance');

var nextComponentId = 1;
var EMPTY_HINTS = { all: true };

var SimpleComponent = module.exports = Class.extend(function(_super) {

    return [

        function() {

            // call the component initialiser to set up necessary
            // component properties
            this._initComponent(nextComponentId++);
            this._componentRenderHints = null;

            // build component structure
            this._root = this._buildComponent();

        },

        'methods', require('./mixin'),
        'methods', {

            getComponentRoot: function() {
                return this._root;
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
                Hiro.renderRequested(this);
            },

            renderImmediately: function() {
                var hints = this._componentRenderHints;
                this._renderComponent(hints || EMPTY_HINTS);
                if (hints) {
                    for (var k in hints) hints[k] = false;
                }
            },

            // this method must be overridden to return the root DOM node for
            // this component.
            _buildComponent: function() {
                throw new Error("you must override _buildComponent()");
            }

        }

    ];

});