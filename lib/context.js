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