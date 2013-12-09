
var spaghetti = require(EXAMPLE_ROOT + '/..');

module.exports = new spaghetti.FlowSpec({
	
	flowPath:  __dirname + '/flows',
	statePath: __dirname + '/states',
	
	start: 'checkoutFlow',
	
	errorState: 'errorView'
});