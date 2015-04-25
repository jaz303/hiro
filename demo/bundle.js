(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/jason/dev/projects/hiro/demo/main.js":[function(require,module,exports){
var Hiro = require('../');

window.init = function() {

    Hiro.init();

    var root = new TestComponent('green');
    var c1 = new TestComponent('red');
    var c2 = new TestComponent('blue');
    var c3 = new TestComponent('orange');

    root.append(c1);
    root.append(c2);

    c2.setTitleComponent(c3);

    Hiro.append(root);

    setTimeout(function() {
        c2.setTitleComponent(null);
    }, 2000);

}

var SimpleComponent = require('../lib/SimpleComponent');

var TestComponent = SimpleComponent.extend(function(_super) {
    return [
        function(color) {
            
            _super.constructor.call(this);
            this._root.style.backgroundColor = color;

            var self = this;
            setInterval(function() {
                self.render();
            }, 10);

        },
        'methods', {
            _buildComponent: function() {
                var root = document.createElement('div');
                root.style.padding = '30px';

                var title = this.title = document.createElement('div');
                title.textContent = 'This is the mountpoint';
                root.appendChild(title);

                var children = document.createElement('div');
                root.appendChild(children);

                this.mountpoint = Hiro.addMountpoint(this, title);
                this.children = Hiro.addCollection(this, children);

                return root;
            },
            setTitleComponent: function(component) {
                if (component) {
                    this.mountpoint.setComponent(component);
                } else {
                    this.mountpoint.removeComponent();
                }
            },
            append: function(component) {
                this.children.append(component);
            },
            _renderComponent: function() {
                this.title.textContent = Math.floor(Date.now() / 1000);
            }
        }
    ]
});


// var SimpleComponent = require('../SimpleComponent');
// var SimpleContainer = require('../SimpleContainer');

// var Root = SimpleContainer.extend(function(_super) {
//     return [
//         function() {
//             _super.constructor.call(this);
//         },
//         'methods', {
//             _buildComponent: function() {
//                 var root = document.createElement('div');
//                 root.className = 'root';
//                 return root;
//             }
//         }
//     ]
// });

// var List = SimpleContainer.extend(function(_super) {
//     return [
//         function() {
//             _super.constructor.call(this);
//         },
//         'methods', {
//             _buildComponent: function() {
//                 var root = document.createElement('div');
//                 root.className = 'list';
//                 return root;
//             },
//             componentWillMount: function() {
//                 console.log("list will mount");
//                 _super.componentWillMount.call(this);
//             }
//         }
//     ]
// });

// var Child = SimpleComponent.extend(function(_super) {
//     return [
//         function(className) {
//             this._className = className;
//             _super.constructor.call(this);
//         },
//         'methods', {
//             _buildComponent: function() {
//                 var root = document.createElement('div');
//                 root.className = 'child ' + this._className;
//                 return root;
//             },
//             componentWillMount: function() {
//                 console.log("child %s will mount", this._className);
//             },
//             _render: function() {
//                 console.log("child %s is rendering", this._className);
//             }
//         }
//     ]
// });

// window.init = function() {

//     var root = new Root();
//     root.mountAsRootComponent();

//     var l1 = new List();
//     root.addChildComponent(l1);

//     var l2 = new List();
    
//     var c1 = new Child('c1');
//     var c2 = new Child('c2');
//     var c3 = new Child('c3');

//     l1.addChildComponent(c1);
//     l1.addChildComponent(c2);
    
//     l2.addChildComponent(c3);
//     l1.removeChildComponent(c2);
//     l2.addChildComponent(c2);

//     l2.removeChildComponent(c3);
//     l2.addChildComponent(c3);

//     for (var i = 0; i < 100; ++i) {
//         c1.render();
//         c2.render();
//         c3.render();
//     }

//     setTimeout(function() {
//         root.addChildComponent(l2);
//     }, 500);


// }
},{"../":"/Users/jason/dev/projects/hiro/index.js","../lib/SimpleComponent":"/Users/jason/dev/projects/hiro/lib/SimpleComponent.js"}],"/Users/jason/dev/projects/hiro/index.js":[function(require,module,exports){
// TODO: iterate debug method that compares live/target trees after each sync
// TODO: housekeeping; lifecycle callbacks
// TODO: destroy callback
// TODO: rendering
// TODO: mountpoints

// TODO: benchmark
// - demo page with graphing, updating table
// - reuse-pool

// v2
// - instantiate from pre-existing HTML structure

module.exports = require('./lib/instance');

// function hiro() {

//     var ROOT_COMPONENT_ID = '__root__' + Math.random();

//     var N = (typeof Symbol === 'undefined')
//                 ? '__hiroNode__'
//                 : Symbol("hiroNode");

//     function Node(component) {
//         this.component = component;
//         this.containers = component.getComponentContainers();
//         this.containersDirty = [];
//         this.logicalParent = null;
//         this.logicalChildren = [];
//         this.liveParent = null;
//         this.liveChildren = [];
//         this.liveIsMounted = false;
//         for (var i = 0; i < this.containers.length; ++i) {
//             this.containersDirty.push(false);
//             this.logicalChildren.push([]);
//             this.liveChildren.push([]);
//         }
//     }

//     var rootComponent = {
//         getComponentId: function() { return ROOT_COMPONENT_ID; },
//         getComponentRoot: function() { return document.body; },
//         getComponentContainers: function() { return [document.body]; }
//     };

//     newComponent(rootComponent);
//     rootComponent[N].liveIsMounted = true;

//     var targetTree      = rootComponent;
//     var liveTree        = rootComponent;
//     var changedParents  = {};
//     var syncTimeout     = null;
//     var after           = [];

//     function newComponent(component) {
//         component[N] = new Node(component);
//     }

//     function childArrayForVia(parentComponent, viaElement) {
//         var ix = parentComponent[N].containers.indexOf(viaElement);
//         if (ix < 0) {
//             throw new Error("no such via-element");
//         } else {
//             return parentComponent[N].logicalChildren[ix];
//         }
//     }

//     function doAppend(parentComponent, childComponent, viaElement) {
//         var children = childArrayForVia(parentComponent, viaElement);
//         children.push(childComponent);
//         childComponent[N].logicalParent = parentComponent;
//     }

//     function doRemove(parentComponent, childComponent, viaElement) {
//         var children = childArrayForVia(parentComponent, viaElement);
//         children.splice(children.indexOf(childComponent), 1);
//         childComponent[N].logicalParent = null;
//     }

//     function logParentChanged(parentComponent, viaElement) {
//         changedParents[parentComponent.getComponentId()] = parentComponent;
//         var node = parentComponent[N];
//         node.containersDirty[node.containers.indexOf(viaElement)] = true;
//     }

//     function appendChildComponent(parentComponent, childComponent, viaElement) {

//         if (childComponent[N].logicalParent) {
//             throw new Error("cannot attach component: already has a parent");
//         }

//         if (!viaElement) {
//             viaElement = parentComponent.getComponentRoot();
//         }
        
//         doAppend(parentComponent, childComponent, viaElement);
//         logParentChanged(parentComponent, viaElement);
//         scheduleSync();

//     }

//     function removeChildComponent(parentComponent, childComponent, viaElement) {

//         if (!childComponent[N].logicalParent) {
//             throw new Error("cannot remove component: no parent");
//         }

//         if (!viaElement) {
//             viaElement = parentComponent.getComponentRoot();
//         }

//         doRemove(parentComponent, childComponent, viaElement);
//         logParentChanged(parentComponent, viaElement);
//         scheduleSync();

//     }

//     function removeAllChildComponents(parentComponent, viaElement) {

//         if (!viaElement) {
//             viaElement = parentComponent.getComponentRoot();
//         }

//         var children = childArrayForVia(parentComponent, viaElement);
//         children.forEach(function(child) {
//             child[N].logicalParent = null;
//         });
//         children.splice(0, children.length);

//         logParentChanged(parentComponent, viaElement);
//         scheduleSync();

//     }

//     function afterUpdate(cb) {
//         after.push(cb);
//     }

//     function scheduleSync() {
//         if (!syncTimeout) {
//             syncTimeout = raf(sync);
//         }
//     }

//     function sync() {

//         syncTimeout = null;

//         function syncChildLists(parentComponent, viaElement, targetList, liveList) {

//             var parentIsMounted = parentComponent[N].liveIsMounted;

//             var tp = 0, lp = 0;
            
//             while (tp < targetList.length && lp < liveList.length) {
//                 var target = targetList[tp];
//                 var live = liveList[lp];
//                 if (target === live) {
//                     ++tp; ++lp;
//                 } else {
//                     viaElement.insertBefore(
//                         target.getComponentRoot(),
//                         live.getComponentRoot()
//                     );
//                     // TODO: should probably store the record of what it was mounted against
//                     // then we can check if it's actually changed.
//                     target[N].liveParent = parentComponent;
//                     target[N].liveIsMounted = parentIsMounted;
//                     // TODO: this isn't quite right
//                     liveList.splice(lp - 1, 0, liveNodes[target.getComponentId()]);
//                     tp++;
//                 }
//             }

//             if (tp < targetList.length) {
//                 while (tp < targetList.length) {
//                     var target = targetList[tp];
//                     viaElement.appendChild(target.getComponentRoot());
//                     liveList.push(target);
//                     ++tp;
//                 }
//             } else if (lp < liveList.length) {
//                 var spliceStart = lp;
//                 while (lp < liveList.length) {
//                     var victim = liveList[lp];
//                     // TODO: call willUnmount()
//                     // TODO: need to propagate these calls to live children
//                     viaElement.removeChild(victim.getComponentRoot());
//                     victim[N].liveParent = null;
//                     victim[N].liveIsMounted = false;
//                     // TODO: call didUnmount()
//                     ++lp;
//                 }
//                 liveList.splice(spliceStart, liveList.length - spliceStart);
//             }

//         }

//         for (var componentId in changedParents) {
//             var component = changedParents[componentId];
//             var node = component[N];
//             node.containers.forEach(function(via, ix) {
//                 if (node.containersDirty[ix]) {
//                     syncChildLists(
//                         component,
//                         via,
//                         node.logicalChildren[ix],
//                         node.liveChildren[ix]
//                     );
//                     node.containersDirty[ix] = false;
//                 }
//             });
//         }

//         changedParents = {};

//         if (afterUpdate.length) {
//             var nowAfter = after;
//             after = [];
//             nowAfter.forEach(function(cb) {
//                 try {
//                     cb();
//                 } catch (e) {
//                     console.error(e);
//                 }
//             });
//         }

//     }

//     return {
//         rootComponent               : rootComponent,
//         newComponent                : newComponent,
//         appendChildComponent        : appendChildComponent,
//         removeChildComponent        : removeChildComponent,
//         removeAllChildComponents    : removeAllChildComponents,
//         afterUpdate                 : afterUpdate
//     };

// }

},{"./lib/instance":"/Users/jason/dev/projects/hiro/lib/instance.js"}],"/Users/jason/dev/projects/hiro/lib/Collection.js":[function(require,module,exports){
module.exports = Collection;

var Hiro = require('./instance');
var N = require('./node_key');

function Collection(component, el) {
	this._component = component;
	this._el = el;
	this._dirty = false;
	this._logicalChildren = [];
	this._liveChildren = [];
}

Collection.prototype.clear = function() {
	this._logicalChildren.forEach(function(child) {
		child[N].__logicalParent = null;
	});
	this._logicalChildren.splice(0, this._logicalChildren.length);
	Hiro.logChange(this);
}

Collection.prototype.remove = function(component) {
	var ix = this._logicalChildren.indexOf(component);
	if (ix < 0) {
		throw new Error("no such child");
	}
	this._logicalChildren.splice(ix, 1);
	component[N].__logicalParent = null;
	this._dirty = true;
	Hiro.logChange(this);
}

Collection.prototype.append = function(component) {
	if (component[N].__logicalParent !== null) {
		throw new Error("cannot add component as child, already has a parent");
	}
	this._logicalChildren.push(component);
	component[N].__logicalParent = this._component;
	this._dirty = true;
	Hiro.logChange(this);
}

Collection.prototype.syncImmediately = function() {
	
	var parentIsMounted = this._component[N].__liveIsMounted;
	var targetList = this._logicalChildren;
	var liveList = this._liveChildren;

	var tp = 0, lp = 0;

	while (tp < targetList.length && lp < liveList.length) {
	    var target = targetList[tp];
	    var live = liveList[lp];
	    if (target === live) {
	        ++tp; ++lp;
	    } else {
	    	this._el.insertBefore(
	            target.getComponentRoot(),
	            live.getComponentRoot()
	        );
	        // TODO: should probably store the record of what it was mounted against
	        // then we can check if it's actually changed.
	        target[N].__liveParent = parentComponent;
	        target[N].__liveIsMounted = parentIsMounted;
	        // TODO: this isn't quite right
	        liveList.splice(lp - 1, 0, liveNodes[target.getComponentId()]);
	        tp++;
	    }
	}

	if (tp < targetList.length) {
	    while (tp < targetList.length) {
	        var target = targetList[tp];
	        this._el.appendChild(target.getComponentRoot());
	        liveList.push(target);
	        ++tp;
	    }
	} else if (lp < liveList.length) {
	    var spliceStart = lp;
	    while (lp < liveList.length) {
	        var victim = liveList[lp];
	        // TODO: call willUnmount()
	        // TODO: need to propagate these calls to live children
	        this._el.removeChild(victim.getComponentRoot());
	        victim[N].__liveParent = null;
	        victim[N].__liveIsMounted = false;
	        // TODO: call didUnmount()
	        ++lp;
	    }
	    liveList.splice(spliceStart, liveList.length - spliceStart);
	}

	this._dirty = false;

}
},{"./instance":"/Users/jason/dev/projects/hiro/lib/instance.js","./node_key":"/Users/jason/dev/projects/hiro/lib/node_key.js"}],"/Users/jason/dev/projects/hiro/lib/Mountpoint.js":[function(require,module,exports){
module.exports = Mountpoint;

var Hiro = require('./instance');
var N = require('./node_key');

function Mountpoint(component, el) {
	this._component = component;
	this._el = el;
	this._parent = el.parentNode;
	this._dirty = false;
	this._logicalChild = null;
	this._liveChild = null;

	if (!this._parent) {
		throw new Error("could not determine parent node for mountpoint");
	}
}

Mountpoint.prototype.removeComponent = function() {
	if (this._logicalChild === null) {
		throw new Error("no such child");
	}
	this._logicalChild[N].__logicalParent = null;
	this._logicalChild = null;
	this._dirty = true;
	Hiro.logChange(this);
}

Mountpoint.prototype.setComponent = function(component) {
	if (component[N].__logicalParent !== null) {
		throw new Error("cannot add component as child, already has a parent");
	}
	this._logicalChild = component;
	component[N].__logicalParent = this._component;
	this._dirty = true;
	Hiro.logChange(this);
}

Mountpoint.prototype.syncImmediately = function() {
	if (!this._dirty) {
		return;
	}
	if (this._logicalChild !== this._liveChild) {
		var elementToReplace = this._liveChild
								? this._liveChild.getComponentRoot()
								: this._el;
		var elementToInsert = this._logicalChild
								? this._logicalChild.getComponentRoot()
								: this._el;
		// TODO(jwf): lifecycle methods
		this._parent.replaceChild(elementToInsert, elementToReplace);
		this._liveChild = this._logicalChild;
	}
	this._dirty = false;
}

},{"./instance":"/Users/jason/dev/projects/hiro/lib/instance.js","./node_key":"/Users/jason/dev/projects/hiro/lib/node_key.js"}],"/Users/jason/dev/projects/hiro/lib/SimpleComponent.js":[function(require,module,exports){
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
},{"./instance":"/Users/jason/dev/projects/hiro/lib/instance.js","./mixin":"/Users/jason/dev/projects/hiro/lib/mixin.js","classkit":"/Users/jason/dev/projects/hiro/node_modules/classkit/index.js"}],"/Users/jason/dev/projects/hiro/lib/instance.js":[function(require,module,exports){
var Hiro = module.exports = {};

var IDLE		= 1,
	HIERARCHY	= 2,
	RENDER 		= 3,
	AFTER 		= 4;

var Collection = require('./Collection');
var Mountpoint = require('./Mountpoint');
var N = require('./node_key');
var raf = require('./raf');

var rootComponent 	= null;
var rootCollection	= null;

var phase 			= IDLE;
var changes 		= [];
var renders 		= [];
var syncTimeout 	= null;
var afterUpdate 	= [];

Hiro.init = function() {

	var ROOT_COMPONENT_ID = '__root__' + Math.random();

	rootComponent = {
		getComponentId: function() { return ROOT_COMPONENT_ID; },
		getComponentRoot: function() { return document.body; }
	};

	rootComponent[N] = new Node(rootComponent);
	rootComponent[N].__liveIsMounted = true;
	rootCollection = new Collection(rootComponent, document.body);

}

Hiro.append = function(component) {
	rootCollection.append(component);
}

Hiro.clear = function() {
	rootCollection.clear();
}

Hiro.remove = function(component) {
	rootCollection.remove(component);
}

Hiro.componentCreated = function(component) {
	component[N] = new Node(component);
}

Hiro.renderRequested = function(component) {
	if (phase === RENDER) {
		// TODO: this should really just be pushed onto a list
		// of pending ops so it can be picked up at the other
		// end. This works fine for now though.
		component.renderImmediately();
	} else {
		if (renders.indexOf(component) < 0) {
			renders.push(component);
			scheduleSync();
		}	
	}
	
}

Hiro.logChange = function(thing) {
	if (changes.indexOf(thing) < 0) {
		changes.push(thing);
		scheduleSync();
	}
}

Hiro.addCollection = function(component, el) {
	// TODO: stash this on component[N] somewhere?
	return new Collection(component, el);
}

Hiro.addMountpoint = function(component, el) {
	// TODO: stash this on component[N] somewhere?
	return new Mountpoint(component, el);
}

//
//

function Node(component) {
	this.__component = component;
	this.__logicalParent = null;
	this.__liveParent = null;
	this.__liveIsMounted = false;
}

function scheduleSync() {
	if (!syncTimeout) {
		syncTimeout = raf(syncImmediately);
	}
}

function syncImmediately() {
	
	syncTimeout = null;

	phase = HIERARCHY;
	
	if (changes.length) {
		changes.forEach(function(changed) {
			changed.syncImmediately();
		});
		changes = [];	
	}

	phase = RENDER;

	if (renders.length) {
		renders.forEach(function(component) {
			
			component.renderImmediately();	

			// TODO: come back to this... the collections currently aren't
			// propagating changes to the mount state...
			// if (component[N].__liveIsMounted) {
			// 	component.renderImmediately();	
			// } else {
			// 	// TODO: should we put this into some deferred list?
			// 	// or mark the fact render is pending?
			// }

		});
		renders = [];
	}

	phase = AFTER;
	
	if (afterUpdate.length) {
	    var nowAfter = after;
	    after = [];
	    nowAfter.forEach(function(cb) {
	        try {
	            cb();
	        } catch (e) {
	            console.error(e);
	        }
	    });
	}

	phase = IDLE;

}
},{"./Collection":"/Users/jason/dev/projects/hiro/lib/Collection.js","./Mountpoint":"/Users/jason/dev/projects/hiro/lib/Mountpoint.js","./node_key":"/Users/jason/dev/projects/hiro/lib/node_key.js","./raf":"/Users/jason/dev/projects/hiro/lib/raf.js"}],"/Users/jason/dev/projects/hiro/lib/mixin.js":[function(require,module,exports){
var Hiro = require('./instance');

var EMPTY_HINTS = { all: true };

module.exports = {

	getComponentId: function() {
		return this._componentId;
	},

	getComponentRoot: function() {
		throw new Error("you must override getComponentRoot()");
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

	_initComponent: function(componentId) {
		this._componentId = componentId;
		this._componentRenderHints = null;
		Hiro.componentCreated(this);
	},

	_renderComponent: function(hints) {

	}

};
},{"./instance":"/Users/jason/dev/projects/hiro/lib/instance.js"}],"/Users/jason/dev/projects/hiro/lib/node_key.js":[function(require,module,exports){
module.exports =  (typeof Symbol === 'undefined')
                	? '__hiroNode__'
                	: Symbol("hiroNode");

},{}],"/Users/jason/dev/projects/hiro/lib/raf.js":[function(require,module,exports){
module.exports = window.requestAnimationFrame
		            || window.msRequestAnimationFrame
		            || window.mozRequestAnimationFrame
		            || window.webkitRequestAnimationFrame
		            || window.oRequestAnimationFrame
		            || function(cb) { setTimeout(cb, 0); };

},{}],"/Users/jason/dev/projects/hiro/node_modules/classkit/index.js":[function(require,module,exports){
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
},{}]},{},["/Users/jason/dev/projects/hiro/demo/main.js"]);
