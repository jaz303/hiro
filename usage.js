//
//

var nextId = 1;
var ctx = null;

function Component(className) {
  this._id = 'component' + (nextId++);
  this._el = document.createElement('div');
  this._el.className = className;
  ctx.newComponent(this, [this._el]);
}

Component.prototype.getComponentId = function() {
  return this._id;
}

Component.prototype.getComponentRoot = function() {
  return this._el;
}



function init() {
  
  ctx = hiroCreate();

  var top1 = new Component('top-1');
  var top2 = new Component('top-2');

  var children = [
      new Component('child-1'),
      new Component('child-2'),
      new Component('child-3'),
      new Component('child-4'),
      new Component('child-5')
  ];

  children.forEach(function(ch) {
    ctx.appendChildComponent(top1, ch);
  });

  ctx.appendChildComponent(ctx.rootComponent, top1);
  ctx.appendChildComponent(ctx.rootComponent, top2);

  ctx.removeChildComponent(top1, children[2]);

  setTimeout(function() {
    ctx.appendChildComponent(top2, children[2]);  
    ctx.appendChildComponent(top1, new Component('child-6'));
  }, 500);

  setTimeout(function() {
    ctx.removeAllChildComponents(top1);
  }, 1500);

}