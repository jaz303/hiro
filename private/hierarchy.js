exports.append  = append;
exports.replace = replace;
exports.remove  = remove;

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