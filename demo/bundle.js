(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/jason/dev/projects/hiro/demo/main.js":[function(require,module,exports){
var hiro = require('../');

window.init = function() {

    var ctx = hiro();
    
    var parentEl = document.createElement('div');
    var text = document.createElement('input');
    parentEl.appendChild(text);
    var btn = document.createElement('button');
    btn.textContent = 'Update';
    parentEl.appendChild(btn);
    var children = document.createElement('ul');
    parentEl.appendChild(children);

    var nums = [];

    btn.onclick = function() {
        nums = text.value.trim().split(',').map(function(v) {
            return parseInt(v.trim()) || 0
        });
        coll.invalidate();
    }

    var parent = {
        getComponentRoot: function() { return parentEl; }
    };

    ctx.componentCreated(parent);
    var coll = ctx.addKeyedCollection(
        parent,
        children, 
        function(cb) { nums.forEach(cb); },
        function(item) { return item; },
        function(item) {
            var li = document.createElement('li');
            li.textContent = item;
            var cmp = {
                getComponentRoot: function() { return li; },
                destroyComponent: function() { console.log("destroying component!"); }
            };
            ctx.componentCreated(cmp);
            return cmp;
        }
    )
    ctx.append(parent);

    // Hiro.init();

    // var root = new TestComponent('green');
    // var c1 = new TestComponent('red');
    // var c2 = new TestComponent('blue');
    // var c3 = new TestComponent('orange');

    // root.append(c1);
    // root.append(c2);

    // c2.setTitleComponent(c3);

    // Hiro.append(root);

    // setTimeout(function() {
    //     c2.setTitleComponent(null);
    // }, 2000);

    // setTimeout(function() {
    //     root.setTitleComponent(c3);
    // }, 4000);

}

// var SimpleComponent = require('../lib/SimpleComponent');

// var TestComponent = SimpleComponent.extend(function(_super) {
//     return [
//         function(color) {
            
//             _super.constructor.call(this);
//             this._root.style.backgroundColor = color;

//             var self = this;
//             setInterval(function() {
//                 self.render();
//             }, 10);

//         },
//         'methods', {
//             _buildComponent: function() {
//                 var root = document.createElement('div');
//                 root.style.padding = '30px';

//                 var title = this.title = document.createElement('div');
//                 title.textContent = 'This is the mountpoint';
//                 root.appendChild(title);

//                 var children = document.createElement('div');
//                 root.appendChild(children);

//                 this.mountpoint = Hiro.addMountpoint(this, title);
//                 this.children = Hiro.addCollection(this, children);

//                 return root;
//             },
//             setTitleComponent: function(component) {
//                 if (component) {
//                     this.mountpoint.setComponent(component);
//                 } else {
//                     this.mountpoint.removeComponent();
//                 }
//             },
//             append: function(component) {
//                 this.children.append(component);
//             },
//             _renderComponent: function() {
//                 this.title.textContent = Math.floor(Date.now() / 1000);
//             }
//         }
//     ]
// });


// // var SimpleComponent = require('../SimpleComponent');
// // var SimpleContainer = require('../SimpleContainer');

// // var Root = SimpleContainer.extend(function(_super) {
// //     return [
// //         function() {
// //             _super.constructor.call(this);
// //         },
// //         'methods', {
// //             _buildComponent: function() {
// //                 var root = document.createElement('div');
// //                 root.className = 'root';
// //                 return root;
// //             }
// //         }
// //     ]
// // });

// // var List = SimpleContainer.extend(function(_super) {
// //     return [
// //         function() {
// //             _super.constructor.call(this);
// //         },
// //         'methods', {
// //             _buildComponent: function() {
// //                 var root = document.createElement('div');
// //                 root.className = 'list';
// //                 return root;
// //             },
// //             componentWillMount: function() {
// //                 console.log("list will mount");
// //                 _super.componentWillMount.call(this);
// //             }
// //         }
// //     ]
// // });

// // var Child = SimpleComponent.extend(function(_super) {
// //     return [
// //         function(className) {
// //             this._className = className;
// //             _super.constructor.call(this);
// //         },
// //         'methods', {
// //             _buildComponent: function() {
// //                 var root = document.createElement('div');
// //                 root.className = 'child ' + this._className;
// //                 return root;
// //             },
// //             componentWillMount: function() {
// //                 console.log("child %s will mount", this._className);
// //             },
// //             _render: function() {
// //                 console.log("child %s is rendering", this._className);
// //             }
// //         }
// //     ]
// // });

// // window.init = function() {

// //     var root = new Root();
// //     root.mountAsRootComponent();

// //     var l1 = new List();
// //     root.addChildComponent(l1);

// //     var l2 = new List();
    
// //     var c1 = new Child('c1');
// //     var c2 = new Child('c2');
// //     var c3 = new Child('c3');

// //     l1.addChildComponent(c1);
// //     l1.addChildComponent(c2);
    
// //     l2.addChildComponent(c3);
// //     l1.removeChildComponent(c2);
// //     l2.addChildComponent(c2);

// //     l2.removeChildComponent(c3);
// //     l2.addChildComponent(c3);

// //     for (var i = 0; i < 100; ++i) {
// //         c1.render();
// //         c2.render();
// //         c3.render();
// //     }

// //     setTimeout(function() {
// //         root.addChildComponent(l2);
// //     }, 500);


// // }
},{"../":"/Users/jason/dev/projects/hiro/index.js"}],"/Users/jason/dev/projects/hiro/index.js":[function(require,module,exports){
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

module.exports = require('./lib/context');

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

},{"./lib/context":"/Users/jason/dev/projects/hiro/lib/context.js"}],"/Users/jason/dev/projects/hiro/lib/BaseCollection.js":[function(require,module,exports){
var Class = require('classkit').Class;
var N = require('./node_key');

var BaseCollection
    = module.exports
    = Class.extend(function(_super) {

return [
    function(ctx, component, el) {
        this.context = ctx;
        this.component = component;
        this.el = el;
        this.dirty = false;
        this._liveChildren = [];
    },
    'methods', {
        context: null,
        component: null,
        el: null,
        dirty: null,
        _liveChildren: null,

        willMount: function() {
            this._callOnLiveChildren('willMount');
        },
        willUnmount: function() {
            this._callOnLiveChildren('willUnmount');
        },
        setMounted: function(isMounted) {
            this._callOnLiveChildren('setMounted', isMounted);
        },
        didMount: function() {
            this._callOnLiveChildren('didMount');
        },
        didUnmount: function() {
            this._callOnLiveChildren('didUnmount');
        },
        _callOnLiveChildren: function(method, arg) {
            this._liveChildren.forEach(function(c) { c[N][method](arg); });
        },
        _syncChildren: function(targetList, garbage) {
            var childNodes = this.el.childNodes;
            var parentIsMounted = this.component[N].__liveIsMounted;
            var tp = 0, cp = 0;
            while (tp < targetList.length && cp < childNodes.length) {
                var target = targetList[tp];
                var live  = childNodes[cp].hiroComponent;
                if (target !== live) {
                    this.el.insertBefore(target.getComponentRoot(), childNodes[cp]);
                    // TODO: should probably store the record of what it was mounted against
                    // then we can check if it's actually changed.
                    target[N].__liveParent = this.component;
                    target[N].setMounted(parentIsMounted);
                    // TODO: this isn't quite right?
                }
                ++tp; ++cp;
            }
            if (tp < targetList.length) {
                while (tp < targetList.length) {
                    var target = targetList[tp];
                    this.el.appendChild(target.getComponentRoot());
                    target[N].__liveParent = this.component;
                    target[N].setMounted(parentIsMounted);
                    ++tp;
                }
            } else if (cp < childNodes.length) {
                var p = childNodes.length - 1;
                while (p >= cp) {
                    var victim = childNodes[p];
                    this.el.removeChild(victim);
                    var victimComponent = victim.hiroComponent;
                    victimComponent[N].__liveParent = null;
                    victimComponent[N].setMounted(false);
                    if (!victimComponent[N].__logicalParent) {
                        garbage.push(victimComponent);
                    }
                    --p;
                }
            }
            this._liveChildren = targetList.slice(0);
            this._dirty = false;
        }
    }
];

});
},{"./node_key":"/Users/jason/dev/projects/hiro/lib/node_key.js","classkit":"/Users/jason/dev/projects/hiro/node_modules/classkit/index.js"}],"/Users/jason/dev/projects/hiro/lib/Collection.js":[function(require,module,exports){
var BaseCollection = require('./BaseCollection');
var N = require('./node_key');

var Collection
	= module.exports
	= BaseCollection.extend(function(_super) {

return [
	function(ctx, component, el) {
		_super.constructor.call(this, ctx, component, el);
		this._logicalChildren = [];
	},
	'methods', {
		_logicalChildren: null,

		indexOf: function(component) {
			return this._logicalChildren.indexOf(component);
		},
		componentAtIndex: function(ix) {
			if (ix < 0 || ix >= this._logicalChildren.length) {
				throw new Error("invalid component index: ", ix);
			}
			return this._logicalChildren[ix];
		},
		clear: function() {
			console.warn("Collection::clear() is deprecated");
			this._logicalChildren.forEach(function(child) {
				child[N].__logicalParent = null;
			});
			this._logicalChildren.splice(0, this._logicalChildren.length);
			this.context.logChange(this);
		},
		remove: function(component) {
			var ix = this._logicalChildren.indexOf(component);
			if (ix < 0) throw new Error("no such child");
			this._logicalChildren.splice(ix, 1);
			component[N].__logicalParent = null;
			this.dirty = true;
			this.context.logChange(this);
		},
		append: function(component) {
			if (component[N].__logicalParent !== null) {
				throw new Error("cannot add component as child, already has a parent");
			}
			this._logicalChildren.push(component);
			component[N].__logicalParent = this._component;
			this.dirty = true;
			this.context.logChange(this);
		},
		syncImmediately: function(garbage) {
			this._syncChildren(this._logicalChildren, garbage);
		}
	}
];

});

},{"./BaseCollection":"/Users/jason/dev/projects/hiro/lib/BaseCollection.js","./node_key":"/Users/jason/dev/projects/hiro/lib/node_key.js"}],"/Users/jason/dev/projects/hiro/lib/LazyCollection.js":[function(require,module,exports){
var BaseCollection = require('./BaseCollection');

var LazyCollection
	= module.exports
	= BaseCollection.extend(function(_super) {

return [
	function(ctx, component, el, getChildren) {
		_super.constructor.call(this, ctx, component, el);
		this.dirty = true;
		this._getChildren = getChildren;
	},
	'methods', {
		_getChildren: null,

		invalidate: function() {
			this.dirty = true;
			this.context.logChange(this);
		},
		syncImmediately: function(garbage) {
			this._syncChildren(this._getChildren(), garbage);
		}
	}
];

});

},{"./BaseCollection":"/Users/jason/dev/projects/hiro/lib/BaseCollection.js"}],"/Users/jason/dev/projects/hiro/lib/Mountpoint.js":[function(require,module,exports){
module.exports = Mountpoint;

var N = require('./node_key');

function Mountpoint(ctx, component, el) {
	this.context = ctx;
	this.component = component;
	this.el = el;
	this._parent = el.parentNode;
	this._logicalChild = null;
	this._liveChild = null;

	if (!this._parent) {
		throw new Error("could not determine parent node for mountpoint");
	}
}

Mountpoint.prototype.getComponent = function() {
	return this._logicalChild;
}

Mountpoint.prototype.removeComponent = function() {
	if (this._logicalChild === null) {
		throw new Error("no such child");
	}
	this._logicalChild[N].__logicalParent = null;
	this._logicalChild = null;
	this.context.logChange(this);
}

Mountpoint.prototype.setComponent = function(component) {
	if (component === null) {
		this.removeComponent();
	} else {
		if (component[N].__logicalParent !== null) {
			throw new Error("cannot add component as child, already has a parent");
		}
		this._logicalChild = component;
		component[N].__logicalParent = this.component;
		this.context.logChange(this);
	}
}

Mountpoint.prototype.syncImmediately = function(garbage) {
	if (this._logicalChild !== this._liveChild) {

		var parentIsMounted = this.component[N].__liveIsMounted;
		var incoming = this._logicalChild;
		var outgoing = this._liveChild;

		// if (parentIsMounted) {
		// 	if (this._logicalChild && !this._logicalChild[N].__liveIsMounted) {
		// 		// propagate willMount
		// 	}
		// 	if (this._liveChild) {
		// 		// propagate willUnmount
		// 	}
		// }

		this._parent.replaceChild(
			incoming ? incoming.getComponentRoot() : this.el,
			outgoing ? outgoing.getComponentRoot() : this.el
		);

		this._liveChild = incoming;
		
		if (incoming) {
			incoming[N].__liveParent = this.component;
			incoming[N].setMounted(parentIsMounted);
		}
		
		if (outgoing) {
			outgoing[N].__liveParent = null;
			outgoing[N].setMounted(false);
			if (!outgoing[N].__logicalParent) {
				garbage.push(outgoing);
			}
		}

		// if (parentIsMounted) {
		// 	if ()
		// }

	}
}

Mountpoint.prototype.willMount = function() {
	this._liveChild && this._liveChild[N].willMount();
}

Mountpoint.prototype.willUnmount = function() {
	this._liveChild && this._liveChild[N].willUnmount();
}

Mountpoint.prototype.setMounted = function(isMounted) {
	this._liveChild && this._liveChild[N].setMounted(isMounted);
}

Mountpoint.prototype.didMount = function() {
	this._liveChild && this._liveChild[N].didMount();
}

Mountpoint.prototype.didUnmount = function() {
	this._liveChild && this._liveChild[N].didUnmount();
}

},{"./node_key":"/Users/jason/dev/projects/hiro/lib/node_key.js"}],"/Users/jason/dev/projects/hiro/lib/Node.js":[function(require,module,exports){
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
},{}],"/Users/jason/dev/projects/hiro/lib/context.js":[function(require,module,exports){
var IDLE        = 1,
    HIERARCHY   = 2,
    RENDER      = 3,
    AFTER       = 4;

var Collection = require('./Collection');
var LazyCollection = require('./LazyCollection');
var Mountpoint = require('./Mountpoint');
var N = require('./node_key');
var Node = require('./Node');
var raf = require('./raf');

module.exports = create;
function create(rootElement) {

    rootElement = rootElement || document.body;

    var nextId = 1;
    var phase = IDLE;
    var changes = [];
    var renders = [];
    var syncTimeout = null;
    var afterUpdate = [];

    // Public interface

    var ctx = {
        
        addCollection: function(component, el) {
            var n = component[N];
            var c = new Collection(this, component, el);
            if (!n.__containers) n.__containers = [];
            n.__containers.push(c);
            return c;
        },
        
        addKeyedCollection: function(component, el, forEach, itemKey, componentForItem) {
            var activeComponents = {};
            return this.addLazyCollection(component, el, function() {
                for (var k in activeComponents) activeComponents[k][0] = false;
                var logicalChildren = [];
                forEach(function(i) {
                    var key = itemKey(i);
                    var cmp = activeComponents[key];
                    if (!cmp) {
                        cmp = activeComponents[key] = [true, componentForItem(i)];
                    } else {
                        cmp[0] = true;
                    }
                    logicalChildren.push(cmp[1]);
                });
                for (var k in activeComponents) {
                    if (!activeComponents[k][0]) delete activeComponents[k];
                }
                return logicalChildren;
            });
        },
        
        addLazyCollection: function(component, el, getChildren) {
            var n = component[N];
            var c = new LazyCollection(this, component, el, getChildren);
            if (!n.__containers) n.__containers = [];
            n.__containers.push(c);
            return c;
        },
        
        addMountpoint: function(component, el) {
            var n = component[N];
            var m = new Mountpoint(this, component, el);
            if (!n.__containers) {
                n.__containers = [];
            }
            n.__containers.push(m);
            return m;
        },

        /**
         * Schedule fn to be called after the next completion
         * of this context's update phase.
         */
        afterUpdate: function(fn) {
            afterUpdate.push(fn);
        },

        append: function(component) {
            rootCollection.append(component);
        },

        clear: function() {
            rootCollection.clear();
        },

        /**
         * Call this when you create a new component and need to
         * introduce it to the Hiro context. This function must
         * be called before accessing any other Hiro functionality
         * is utilised.
         */
        componentCreated: function(component) {
            var componentId = nextId++;
            component[N] = new Node(componentId, ctx, component);
            return component;
        },

        destroy: function() {
            // TODO: implement
        },

        logChange: function(thing) {
            if (changes.indexOf(thing) < 0) {
                changes.push(thing);
                scheduleSync();
            }
        },

        remove: function(component) {
            rootCollection.remove(component);
        },

        renderRequested: function(component) {
            component[N].__renderPending = true;
            if (phase === RENDER) {
                // TODO: this should really just be pushed onto a list
                // of pending ops so it can be picked up at the other
                // end. This works fine for now though.
                performVisualUpdates(component);
            } else {
                enqueueComponentForVisualUpdates(component);
            }
        },

        setComponentVisible: function(component, isVisible) {
            isVisible = !!isVisible;
            if (component[N].__logicalVisible !== isVisible) {
                component[N].__logicalVisible = isVisible;
                if (phase === RENDER) {
                    performVisualUpdates(component);
                } else {
                    enqueueComponentForVisualUpdates(component);    
                }
            }
        },

        // private!
        _enqueue: enqueueComponentForVisualUpdates
        
    };

    // Set up root component, collection

    rootElement.innerHTML = '';

    var rootComponent = {
        getComponentRoot: function() { return rootElement; }
    };

    var rootId = nextId++;
    rootComponent[N] = new Node(rootId, ctx, rootComponent);
    rootComponent[N].__liveIsMounted = true;

    var rootCollection = new Collection(ctx, rootComponent, rootElement);

    // Internals

    function enqueueComponentForVisualUpdates(component) {
        if (renders.indexOf(component) < 0) {
            renders.push(component);
            scheduleSync();
        }
    }

    function scheduleSync() {
        if (!syncTimeout) {
            syncTimeout = raf(syncImmediately);
        }
    }

    function performVisualUpdates(component) {
        var n = component[N];
        if (!n.__liveIsMounted) {
            return;
        }
        if (n.__logicalVisible && !n.__liveVisible) {
            component.getComponentRoot().style.display = '';
            n.__liveVisible = true;
        } else if (!n.__logicalVisible && n.__liveVisible) {
            component.getComponentRoot().style.display = 'none';
            n.__liveVisible = false;
        }
        if (n.__liveVisible && n.__renderPending) {
            component.renderImmediately();  
            n.__renderPending = false;
        }
    }

    function syncImmediately() {
        
        syncTimeout = null;

        phase = HIERARCHY;
        
        if (changes.length) {
            var garbage = [];
            changes.forEach(function(changed) {
                changed.syncImmediately(garbage);
            });
            if (garbage.length) {
                garbage.forEach(function(component) {
                    component[N].destroy();
                });
            }
            changes = [];   
        }

        phase = RENDER;

        if (renders.length) {
            renders.forEach(performVisualUpdates);
            renders = [];
        }

        phase = AFTER;
        
        if (afterUpdate.length) {
            var nowAfter = afterUpdate;
            afterUpdate = [];
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

    return ctx;

};
},{"./Collection":"/Users/jason/dev/projects/hiro/lib/Collection.js","./LazyCollection":"/Users/jason/dev/projects/hiro/lib/LazyCollection.js","./Mountpoint":"/Users/jason/dev/projects/hiro/lib/Mountpoint.js","./Node":"/Users/jason/dev/projects/hiro/lib/Node.js","./node_key":"/Users/jason/dev/projects/hiro/lib/node_key.js","./raf":"/Users/jason/dev/projects/hiro/lib/raf.js"}],"/Users/jason/dev/projects/hiro/lib/node_key.js":[function(require,module,exports){
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
