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

module.exports = hiro;

var raf = window.requestAnimationFrame
            || window.msRequestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.oRequestAnimationFrame
            || function(cb) { setTimeout(cb, 0); };

function hiro() {

    var ROOT_COMPONENT_ID = '__root__' + Math.random();

    var N = (typeof Symbol === 'undefined')
                ? '__hiroNode__'
                : Symbol("hiroNode");

    function Node(component) {
        this.component = component;
        this.containers = component.getComponentContainers();
        this.containersDirty = [];
        this.logicalParent = null;
        this.logicalChildren = [];
        this.liveParent = null;
        this.liveChildren = [];
        this.liveIsMounted = false;
        for (var i = 0; i < this.containers.length; ++i) {
            this.containersDirty.push(false);
            this.logicalChildren.push([]);
            this.liveChildren.push([]);
        }
    }

    var rootComponent = {
        getComponentId: function() { return ROOT_COMPONENT_ID; },
        getComponentRoot: function() { return document.body; },
        getComponentContainers: function() { return [document.body]; }
    };

    newComponent(rootComponent);
    rootComponent[N].liveIsMounted = true;

    var targetTree      = rootComponent;
    var liveTree        = rootComponent;
    var changedParents  = {};
    var syncTimeout     = null;
    var after           = [];

    function newComponent(component) {
        component[N] = new Node(component);
    }

    function childArrayForVia(parentComponent, viaElement) {
        var ix = parentComponent[N].containers.indexOf(viaElement);
        if (ix < 0) {
            throw new Error("no such via-element");
        } else {
            return parentComponent[N].logicalChildren[ix];
        }
    }

    function doAppend(parentComponent, childComponent, viaElement) {
        var children = childArrayForVia(parentComponent, viaElement);
        children.push(childComponent);
        childComponent[N].logicalParent = parentComponent;
    }

    function doRemove(parentComponent, childComponent, viaElement) {
        var children = childArrayForVia(parentComponent, viaElement);
        children.splice(children.indexOf(childComponent), 1);
        childComponent[N].logicalParent = null;
    }

    function logParentChanged(parentComponent, viaElement) {
        changedParents[parentComponent.getComponentId()] = parentComponent;
        var node = parentComponent[N];
        node.containersDirty[node.containers.indexOf(viaElement)] = true;
    }

    function appendChildComponent(parentComponent, childComponent, viaElement) {

        if (childComponent[N].logicalParent) {
            throw new Error("cannot attach component: already has a parent");
        }

        if (!viaElement) {
            viaElement = parentComponent.getComponentRoot();
        }
        
        doAppend(parentComponent, childComponent, viaElement);
        logParentChanged(parentComponent, viaElement);
        scheduleSync();

    }

    function removeChildComponent(parentComponent, childComponent, viaElement) {

        if (!childComponent[N].logicalParent) {
            throw new Error("cannot remove component: no parent");
        }

        if (!viaElement) {
            viaElement = parentComponent.getComponentRoot();
        }

        doRemove(parentComponent, childComponent, viaElement);
        logParentChanged(parentComponent, viaElement);
        scheduleSync();

    }

    function removeAllChildComponents(parentComponent, viaElement) {

        if (!viaElement) {
            viaElement = parentComponent.getComponentRoot();
        }

        var children = childArrayForVia(parentComponent, viaElement);
        children.forEach(function(child) {
            child[N].logicalParent = null;
        });
        children.splice(0, children.length);

        logParentChanged(parentComponent, viaElement);
        scheduleSync();

    }

    function afterUpdate(cb) {
        after.push(cb);
    }

    function scheduleSync() {
        if (!syncTimeout) {
            syncTimeout = raf(sync);
        }
    }

    function sync() {

        syncTimeout = null;

        function syncChildLists(parentComponent, viaElement, targetList, liveList) {

            var parentIsMounted = parentComponent[N].liveIsMounted;

            var tp = 0, lp = 0;
            
            while (tp < targetList.length && lp < liveList.length) {
                var target = targetList[tp];
                var live = liveList[lp];
                if (target === live) {
                    ++tp; ++lp;
                } else {
                    viaElement.insertBefore(
                        target.getComponentRoot(),
                        live.getComponentRoot()
                    );
                    // TODO: should probably store the record of what it was mounted against
                    // then we can check if it's actually changed.
                    target[N].liveParent = parentComponent;
                    target[N].liveIsMounted = parentIsMounted;
                    // TODO: this isn't quite right
                    liveList.splice(lp - 1, 0, liveNodes[target.getComponentId()]);
                    tp++;
                }
            }

            if (tp < targetList.length) {
                while (tp < targetList.length) {
                    var target = targetList[tp];
                    viaElement.appendChild(target.getComponentRoot());
                    liveList.push(target);
                    ++tp;
                }
            } else if (lp < liveList.length) {
                var spliceStart = lp;
                while (lp < liveList.length) {
                    var victim = liveList[lp];
                    // TODO: call willUnmount()
                    // TODO: need to propagate these calls to live children
                    viaElement.removeChild(victim.getComponentRoot());
                    victim[N].liveParent = null;
                    victim[N].liveIsMounted = false;
                    // TODO: call didUnmount()
                    ++lp;
                }
                liveList.splice(spliceStart, liveList.length - spliceStart);
            }

        }

        for (var componentId in changedParents) {
            var component = changedParents[componentId];
            var node = component[N];
            node.containers.forEach(function(via, ix) {
                if (node.containersDirty[ix]) {
                    syncChildLists(
                        component,
                        via,
                        node.logicalChildren[ix],
                        node.liveChildren[ix]
                    );
                    node.containersDirty[ix] = false;
                }
            });
        }

        changedParents = {};

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

    }

    return {
        rootComponent               : rootComponent,
        newComponent                : newComponent,
        appendChildComponent        : appendChildComponent,
        removeChildComponent        : removeChildComponent,
        removeAllChildComponents    : removeAllChildComponents,
        afterUpdate                 : afterUpdate
    };

}
