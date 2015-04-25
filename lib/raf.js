module.exports = window.requestAnimationFrame
		            || window.msRequestAnimationFrame
		            || window.mozRequestAnimationFrame
		            || window.webkitRequestAnimationFrame
		            || window.oRequestAnimationFrame
		            || function(cb) { setTimeout(cb, 0); };
