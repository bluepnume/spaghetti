
var spaghetti = require(EXAMPLE_ROOT + '/..');

// Create a new flow spec for our app

module.exports = new spaghetti.FlowSpec({
	
	// Here we provide the directories for our flows and states.
	// This allows the engine to auto load all of our flows and states without requiring each one manually
	
	flowPath:  __dirname + '/flows',
	statePath: __dirname + '/states',
	
	// Obviously we need a starting point
	
	entryFlow: 'checkoutFlow',
	
	// We also register an error state, which is a 'catch-all' error handler. Since we're promise based,
	// we can set this and forget it, then catch anything which goes wrong and provide a pleasant user experience.
	
	errorState: 'errorView'
});