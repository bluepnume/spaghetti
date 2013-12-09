
var q = require('q');
var spaghetti = require(EXAMPLE_ROOT + '/..');

module.exports = new spaghetti.EndState({
	
	name: 'redirectEnd',
	
	// End states should not return any transition. They should do something to finalize the flow,
	// like redirecting, or rendering some json which triggers a window.location change, or something.
	
	execute: function(context) {
		console.log('redirectEnd.execute');
		
		context.response.redirect('http://www.google.com');
	}
})