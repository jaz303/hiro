var Hiro = module.exports = {};

var raf = require('./raf');
var changes = [];
var afterUpdate = [];

function scheduleSync() {
	if (!syncTimeout) {
		syncTimeout = raf(syncImmediately);
	}
}

function syncImmediately() {
	
	syncTimeout = null;
	
	changes.forEach(function(changed) {
		changed.syncImmediately();
	});
	changes = [];

	if (afterUpdate.length) {
	    var nowAfter = after;
	    after = [];
	    nowAfter.forEach(function(cb) {
	        try {
	            cb();
	        } catch (e) {
	            console.error(e);
	        }
	    });
	}

}

Hiro.logMountpointChanged = function(mountpoint) {
	if (changes.indexOf(mountpoint) < 0) {
		changes.push(mountpoint);
		scheduleSync();
	}
}

Hiro.logCollectionChanged = function(collection) {
	if (changes.indexOf(collection) < 0) {
		changes.push(collection);
		scheduleSync();
	}
}