module.exports = create;

var UpdateSet = require('./private/UpdateSet');

function create(q) {

    var render  = q;
    var after   = q.after;


    var scheduled = false;
    var hierarchyUpdates = new UpdateSet();
    var invalidComponents = {};

    function append(parentComponent, childComponent, targetElement) {
        
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

        targetElement.appendChild(rootNode);
        childComponent._componentAttachedParent = parentComponent;
        (parentComponent._componentAttachedChildren
            || (parentComponent._componentAttachedChildren = [])).push(childComponent);

        if (willMount) {
            childComponent.componentDidMount();
        }
    
    }

    function replace(parentComponent, childComponent, targetElement) {

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

        targetElement.parentNode.replaceChild(rootNode, targetElement);
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

        hierarchyUpdates.forEach(function(fn, parentComponent, childComponent, targetElement) {
            fn(parentComponent, childComponent, targetElement);
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