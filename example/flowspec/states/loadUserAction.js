
var q = require('q');

var spaghetti = require(EXAMPLE_ROOT + '/..');

module.exports = new spaghetti.ActionState({
	
	name: 'loadUserAction',
	
	// Since we're in an action state, we have to provide a transition for the
	// flow engine to continue through the flow.
	
	execute: function(context) {
		console.log('loadUserAction.execute');
		
		return q('success').delay(500);
	},
})