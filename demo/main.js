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