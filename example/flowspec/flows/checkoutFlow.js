
var spaghetti = require(EXAMPLE_ROOT + '/..');

// Set up a new flow.
// There's no distinction between a 'flow' and a 'subflow' here. We can re-use flows anywhere.

module.exports = new spaghetti.Flow({
	
	name: 'checkoutFlow',
	
	
	// Naturally we need to know where to start
	
	entryState: 'loginView',
	
	
	// Set up some transitions. These transition names will be returned by the states themselves.
	// This will NOT handle 'events' or actions from the front-end. View states must handle these actions
	// (for example, login button press) and then pass on the appropriate transition name.
	
	transitions: {
		
		loginView: {
			success:  'loadUserAction',
			redirect: 'redirectEnd',
			failed:   'loginView'
		},
		
		loadUserAction: {
			success: 'memberFlow'
		},
		
		memberFlow: {
			success: 'doneView'
		}
	}
})