
var spaghetti = require(EXAMPLE_ROOT + '/..');

module.exports = new spaghetti.Flow({
	
	name: 'memberFlow',
	entryState: 'reviewView',
	
	transitions: {
		
		
		// Notice here we're transitioning to 'return'. This is a special state which exits the flow
		// and goes to the parent flow (which this flow has no awareness of).
		//
		// Spaghetti separates the notions of 'end states' and 'return'. An end state is the end, no
		// matter which subflow we're in, while 'return' will take us up to the parent flow. This means
		// we can safely do early-exits in our flows.
		
		reviewView: {
			success: 'return:authorize',
		}
	}
})