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
        _syncChildren: function(targetList) {
            var liveList = this._liveChildren;
            var parentIsMounted = this.component[N].__liveIsMounted;
            var tp = 0, lp = 0;
            while (tp < targetList.length && lp < liveList.length) {
                var target = targetList[tp];
                var live = liveList[lp];
                if (target === live) {
                    ++tp; ++lp;
                } else {
                    this.el.insertBefore(
                        target.getComponentRoot(),
                        live.getComponentRoot()
                    );
                    liveList.splice(lp - 1, 0, liveNodes[target.getComponentId()]);
                    // TODO: should probably store the record of what it was mounted against
                    // then we can check if it's actually changed.
                    target[N].__liveParent = this.component;
                    target[N].setMounted(parentIsMounted);
                    // TODO: this isn't quite right?
                    tp++;
                }
            }
            if (tp < targetList.length) {
                while (tp < targetList.length) {
                    var target = targetList[tp];
                    this.el.appendChild(target.getComponentRoot());
                    liveList.push(target);
                    target[N].__liveParent = this.component;
                    target[N].setMounted(parentIsMounted);
                    ++tp;
                }
            } else if (lp < liveList.length) {
                var spliceStart = lp;
                while (lp < liveList.length) {
                    var victim = liveList[lp];
                    // TODO: call willUnmount()
                    // TODO: need to propagate these calls to live children
                    this.el.removeChild(victim.getComponentRoot());
                    victim[N].__liveParent = null;
                    victim[N].setMounted(false);
                    // TODO: call didUnmount()
                    ++lp;
                }
                liveList.splice(spliceStart, liveList.length - spliceStart);
            }
            this.dirty = false;
        }
    }
];

});