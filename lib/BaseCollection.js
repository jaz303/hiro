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