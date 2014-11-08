(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/jason/dev/projects/components/SimpleComponent.js":[function(require,module,exports){
var nextComponentId = 1;

var Class = require('classkit').Class;
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
},{"./global_queue":"/Users/jason/dev/projects/components/global_queue.js","./mixin":"/Users/jason/dev/projects/components/mixin.js","classkit":"/Users/jason/dev/projects/components/node_modules/classkit/index.js"}],"/Users/jason/dev/projects/components/SimpleContainer.js":[function(require,module,exports){
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
},{"./SimpleComponent":"/Users/jason/dev/projects/components/SimpleComponent.js"}],"/Users/jason/dev/projects/components/global_queue.js":[function(require,module,exports){
module.exports = require('./queue')(require('render-q')(window));
},{"./queue":"/Users/jason/dev/projects/components/queue.js","render-q":"/Users/jason/dev/projects/components/node_modules/render-q/index.js"}],"/Users/jason/dev/projects/components/mixin.js":[function(require,module,exports){
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
},{}],"/Users/jason/dev/projects/components/node_modules/classkit/index.js":[function(require,module,exports){
exports.Class = Class;

function Class() {};
  
Class.prototype.method = function(name) {
  var self = this, method = this[name];
  return function() { return method.apply(self, arguments); }
}

Class.prototype.lateBoundMethod = function(name) {
  var self = this;
  return function() { return self[name].apply(self, arguments); }
}

Class.extend = function(fn) {

  var features;

  if (fn) {
    // backwards compatibility
    if (fn.length > 1) {
      features = fn(this, this.prototype);
    } else {
      features = fn(this.prototype);
    }
  } else {
    features = [function() {}];
  }
  
  var ctor = features[0];
  ctor._super = this;
  ctor.prototype = Object.create(this.prototype);
  ctor.prototype.constructor = ctor;
  
  ctor.extend = this.extend;
  ctor.Features = Object.create(this.Features);
    
  for (var i = 1; i < features.length; i += 2) {
    this.Features[features[i]](ctor, features[i+1]);
  }
  
  return ctor;
  
};

Class.Features = {
  methods: function(ctor, methods) {
    for (var methodName in methods) {
      ctor.prototype[methodName] = methods[methodName];
    }
  },
  properties: function(ctor, properties) {
    Object.defineProperties(ctor.prototype, properties);
  },
  delegate: function(ctor, delegates) {
    for (var methodName in delegates) {
      var target = delegates[methodName];
      if (Array.isArray(target)) {
        ctor.prototype[methodName] = makeDelegate(target[0], target[1]);
      } else {
        ctor.prototype[methodName] = makeDelegate(target, methodName);
      }
    }
  }
};

function makeDelegate(member, method) {
  return function() {
    var target = this[member];
    return target[method].apply(target, arguments);
  }
}
},{}],"/Users/jason/dev/projects/components/node_modules/render-q/index.js":[function(require,module,exports){
module.exports = function(win) {

    var rendering   = false;
    var sched       = false;
    var queue       = [];
    var aft         = [];
    
    function error(phase, error) {
        console.error(phase, error);
    }

    function drain() {

        sched = false;

        //
        // 1. render

        var now = queue;
        queue = [];

        rendering = true;
        for (var i = 0, len = now.length; i < len; ++i) {
            try {
                now[i]();
            } catch (e) {
                error('render', e);
            }
        }
        rendering = false;

        //
        // 2. after callbacks

        var now = aft;
        aft = [];

        for (var i = 0, len = now.length; i < len; ++i) {
            try {
                now[i]();
            } catch (e) {
                error('after', e);
            }
        }

    }

    function enqueue(cb) {
        if (rendering) {
            try {
                cb();    
            } catch (e) {
                error('render', e);
            }
        } else {
            later(cb);
        }
    }

    function later(cb) {
        queue.push(cb);
        if (!sched) {
            sched = true;
            win.requestAnimationFrame(drain);
        }
    }

    function after(cb) {
        aft.push(cb);
    }

    enqueue.later = later;
    enqueue.after = after;
    enqueue.isRendering = function() { return rendering; }

    return enqueue;

}
},{}],"/Users/jason/dev/projects/components/private/UpdateSet.js":[function(require,module,exports){
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
},{}],"/Users/jason/dev/projects/components/queue.js":[function(require,module,exports){
module.exports = create;

var UpdateSet = require('./private/UpdateSet');

function create(q) {

    var render  = q;
    var after   = q.after;

	var scheduled = false;
    var hierarchyUpdates = new UpdateSet();
    var invalidComponents = {};

    function append(parentComponent, childComponent, targetElement) {
        insert(parentComponent, childComponent, targetElement, false);
    }

    function replace(parentComponent, childComponent, targetElement) {
    	insert(parentComponent, childComponent, targetElement, true);
    }

    function insert(parentComponent, childComponent, targetElement, replace) {

    	var currentParent   = childComponent._componentAttachedParent;
    	var rootNode        = childComponent.getComponentRootNode();
    	var wasMounted      = false;

    	if (currentParent) {
    	    wasMounted = currentParent.isComponentMounted();
    	    rootNode.parentNode.removeChild(rootNode);
    	    var ch = currentParent._componentAttachedChildren;
    	    ch.splice(ch.indexOf(childComponent), 1);
    	}

    	var willMount = parentComponent.isComponentMounted() && !wasMounted;

    	if (willMount) {
    	    childComponent.componentWillMount();
    	}

    	if (replace) {
    		targetElement.parentNode.replaceChild(rootNode, targetElement);
    	} else {
    		targetElement.appendChild(rootNode);	
    	}

    	childComponent._componentAttachedParent = parentComponent;
    	(parentComponent._componentAttachedChildren
    	    || (parentComponent._componentAttachedChildren = [])).push(childComponent);

    	if (willMount) {
    	    childComponent.componentDidMount();
    	}

    }

    function remove(parentComponent, childComponent) {

        var currentParent = childComponent._componentAttachedParent;
        if (!currentParent) {
            return;
        }

        var rootNode = childComponent.getComponentRootNode();
        var wasMounted = currentParent.isComponentMounted();

        if (wasMounted) {
            childComponent.componentWillUnmount();
        }

        rootNode.parentNode.removeChild(rootNode);
        var ch = currentParent._componentAttachedChildren;
        ch.splice(ch.indexOf(childComponent), 1);
        childComponent._componentAttachedParent = null;

        if (wasMounted) {
            childComponent.componentDidUnmount();
        }

    }

    function process() {

        scheduled = false;

        hierarchyUpdates.forEach(function(op) {
            op[0](op[1], op[2], op[3]);
        });
        hierarchyUpdates.clear();

        for (var k in invalidComponents) {
            invalidComponents[k].renderImmediately();
        }
        invalidComponents = {};

    }

    function schedule() {
        if (!scheduled) {
            scheduled = true;
            render(process);
        }
    }

    q.attachComponentViaElement = function(parentComponent, childComponent, targetElement) {
        hierarchyUpdates.push(
            childComponent._componentId,
            [append, parentComponent, childComponent, targetElement]
        );
        schedule();
    }

    q.attachComponentByReplacingElement = function(parentComponent, childComponent, targetElement) {
        hierarchyUpdates.push(
            childComponent._componentId,
            [replace, parentComponent, childComponent, targetElement]
        );
        schedule();
    }

    q.detachComponentViaElement = function(parentComponent, childComponent) {
        hierarchyUpdates.push(
            childComponent._componentId,
            [remove, parentComponent, childComponent, null]
        );
        schedule();
    }

    q.renderComponent = function(component) {
        invalidComponents[component._componentId] = component;
        schedule();
    }

    return q;

}
},{"./private/UpdateSet":"/Users/jason/dev/projects/components/private/UpdateSet.js"}],"/Users/jason/dev/projects/components/test/main.js":[function(require,module,exports){
var SimpleComponent	= require('../SimpleComponent');
var SimpleContainer	= require('../SimpleContainer');

var Root = SimpleContainer.extend(function(_super) {
	return [
		function() {
			_super.constructor.call(this);
		},
		'methods', {
			_buildComponent: function() {
				var root = document.createElement('div');
				root.className = 'root';
				return root;
			}
		}
	]
});

var List = SimpleContainer.extend(function(_super) {
	return [
		function() {
			_super.constructor.call(this);
		},
		'methods', {
			_buildComponent: function() {
				var root = document.createElement('div');
				root.className = 'list';
				return root;
			},
			componentWillMount: function() {
				console.log("list will mount");
				_super.componentWillMount.call(this);
			}
		}
	]
});

var Child = SimpleComponent.extend(function(_super) {
	return [
		function(className) {
			this._className = className;
			_super.constructor.call(this);
		},
		'methods', {
			_buildComponent: function() {
				var root = document.createElement('div');
				root.className = 'child ' + this._className;
				return root;
			},
			componentWillMount: function() {
				console.log("child %s will mount", this._className);
			},
			_render: function() {
				console.log("child %s is rendering", this._className);
			}
		}
	]
});

window.init = function() {

	var root = new Root();
	root.mountAsRootComponent();

	var l1 = new List();
	root.addChildComponent(l1);

	var l2 = new List();
	
	var c1 = new Child('c1');
	var c2 = new Child('c2');
	var c3 = new Child('c3');

	l1.addChildComponent(c1);
	l1.addChildComponent(c2);
	
	l2.addChildComponent(c3);
	l1.removeChildComponent(c2);
	l2.addChildComponent(c2);

	l2.removeChildComponent(c3);
	l2.addChildComponent(c3);

	for (var i = 0; i < 100; ++i) {
		c1.render();
		c2.render();
		c3.render();
	}

	setTimeout(function() {
		root.addChildComponent(l2);
	}, 500);


}
},{"../SimpleComponent":"/Users/jason/dev/projects/components/SimpleComponent.js","../SimpleContainer":"/Users/jason/dev/projects/components/SimpleContainer.js"}]},{},["/Users/jason/dev/projects/components/test/main.js"]);
