module.exports = create;

var UpdateSet   = require('./private/UpdateSet');

var hierarchy   = require('./private/hierarchy');
var append      = hierarchy.append;
var replace     = hierarchy.replace;
var remove      = hierarchy.remove;

function create(q) {

    var render  = q;
    var after   = q.after;

    var scheduled           = false;
    var hierarchyUpdates    = new UpdateSet();
    var layoutRequired      = {};
    var layoutPerformed     = null;
    var invalidComponents   = {};
    var phase               = null;

    //
    // Processing

    function process() {
        scheduled = false;
        processHierarchy();
        processLayout();
        processRender();
        phase = null;
    }

    function processHierarchy() {
        phase = 'h';
        hierarchyUpdates.forEach(function(op) {
            op[0](op[1], op[2], op[3]);
        });
        hierarchyUpdates.clear();
    }

    function layoutOne(component) {
        var cid = component._componentId;
        if (!layoutPerformed[cid]) {
            layoutPerformed[cid] = true;
            component.layoutImmediately();
        }
    }

    function tsort() {

        for (var k in layoutRequired) {
            layoutRequired[k]._componentLayoutState = 0;
        }

        var sorted = [];
        for (var k in layoutRequired) {
            _visit(layoutRequired[k]);
        }

        return sorted;

        function _visit(c) {
            if (c._componentLayoutState === 1) {
                throw new Error("wtf, cycle detected!");
            } else if (c._componentLayoutState === 0) {
                c._componentLayoutState = 1;
                var isMounted = null;
                var tmp = c._componentAttachedParent;
                while (tmp) {
                    if (tmp._componentId in layoutRequired) {
                        isMounted = _visit(tmp);
                        break;
                    }
                    tmp = tmp._componentAttachedParent;
                }
                if (isMounted === null) {
                    isMounted = c.isComponentMounted();
                }
                c._componentLayoutState = isMounted ? 2 : 3;
                if (isMounted) {
                    sorted.push(c);    
                }
            }
            return c._componentLayoutState === 2;
        }

    }

    function processLayout() {
        phase = 'l';
        layoutPerformed = {};
        tsort().forEach(layoutOne);
        layoutPerformed = null;
    }

    function processRender() {
        phase = 'r';
        for (var k in invalidComponents) {
            invalidComponents[k].renderImmediately();
        }
        invalidComponents = {};
    }

    //
    //

    function schedule() {
        if (!scheduled) {
            scheduled = true;
            render(process);
        }
    }

    //
    // Hierarchy operations

    function assertNotProcessing() {
        // TODO: it should be OK to relax this restriction as long as the
        // UpdateSet is adjusted accordingly.
        if (phase !== null) {
            throw new Error("component hierarchy cannot be changed during queue processing");
        }
    }

    q.attachComponentViaElement = function(parentComponent, childComponent, targetElement) {
        assertNotProcessing();
        hierarchyUpdates.push(
            childComponent._componentId,
            [append, parentComponent, childComponent, targetElement]
        );
        schedule();
    }

    q.attachComponentByReplacingElement = function(parentComponent, childComponent, targetElement) {
        assertNotProcessing();
        hierarchyUpdates.push(
            childComponent._componentId,
            [replace, parentComponent, childComponent, targetElement]
        );
        schedule();
    }

    q.detachComponentViaElement = function(parentComponent, childComponent) {
        assertNotProcessing();
        hierarchyUpdates.push(
            childComponent._componentId,
            [remove, parentComponent, childComponent, null]
        );
        schedule();
    }

    //
    // Layout

    q.layoutComponent = function(component) {
        if (phase === 'r') {
            throw new Error("layout not allowed during the render phase!");
        } else if (phase === 'l') {
            layoutOne(component);
        } else {
            layoutRequired[component._componentId] = component;
            if (phase === null) {
                schedule();    
            }
        }
    }

    //
    // Render

    q.renderComponent = function(component) {
        if (phase === 'r') {
            // TODO: this should really just be pushed onto a list
            // of pending ops so it can be picked up at the other
            // end. This works fine for now though.
            component.renderImmediately();
        } else {
            invalidComponents[component._componentId] = component;
            schedule();
        }
    }

    return q;

}