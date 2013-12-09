
var q = require('q');

var spaghetti = require(EXAMPLE_ROOT + '/..');

module.exports = new spaghetti.ActionState({
	
	name: 'loadUserAction',
	
	execute: function() {
		console.log('loadUserAction.execute');
		
		return q('success').delay(500);
	},
})