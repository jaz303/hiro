var SimpleComponent	= require('../SimpleComponent');
var SimpleContainer	= require('../SimpleContainer');

var Root = SimpleContainer.extend(function(_super) {
	return [
		function() {
			_super.constructor.call(this);
		},
		'methods', {
			_buildComponent: function() {
				var root = document.createElement('div');
				root.className = 'root';
				return root;
			}
		}
	]
});

var List = SimpleContainer.extend(function(_super) {
	return [
		function() {
			_super.constructor.call(this);
		},
		'methods', {
			_buildComponent: function() {
				var root = document.createElement('div');
				root.className = 'list';
				return root;
			}
		}
	]
});

var Child = SimpleComponent.extend(function(_super) {
	return [
		function(className) {
			this._className = className;
			_super.constructor.call(this);
		},
		'methods', {
			_buildComponent: function() {
				var root = document.createElement('div');
				root.className = 'child ' + this._className;
				return root;
			},
			componentWillMount: function() {
				console.log("child %s will mount", this._className);
			}
		}
	]
});

window.init = function() {

	var root = new Root();
	root.mountAsRootComponent();

	var l1 = new List();
	root.addChildComponent(l1);

	var l2 = new List();
	
	var c1 = new Child('c1');
	var c2 = new Child('c2');
	var c3 = new Child('c3');

	l1.addChildComponent(c1);
	l1.addChildComponent(c2);
	l2.addChildComponent(c3);
	l1.removeChildComponent(c2);
	l2.addChildComponent(c2);

	setTimeout(function() {
		root.addChildComponent(l2);
	}, 500);


}