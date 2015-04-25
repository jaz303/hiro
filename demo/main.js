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
        console.log("boom...");
        c2.setTitleComponent(null);
    }, 2000);

}

var nextId = 1;

function TestComponent(color) {
    
    this.id = 'component-' + (nextId++);
    this.root = document.createElement('div');
    this.root.style.padding = '30px';
    this.root.style.backgroundColor = color;

    var title = document.createElement('div');
    title.textContent = 'This is the mountpoint';
    this.root.appendChild(title);

    var children = document.createElement('div');
    this.root.appendChild(children);

    Hiro.componentCreated(this);

    this.mountpoint = Hiro.addMountpoint(this, title);
    this.children = Hiro.addCollection(this, children);

}

TestComponent.prototype.setTitleComponent = function(component) {
    if (component) {
        this.mountpoint.setComponent(component);
    } else {
        this.mountpoint.removeComponent();
    }
}

TestComponent.prototype.getComponentId = function() {
    return this.id;
}

TestComponent.prototype.getComponentRoot = function() {
    return this.root;
}

TestComponent.prototype.append = function(component) {
    this.children.append(component);
}



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