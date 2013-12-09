
var q = require('q');
var spaghetti = require(EXAMPLE_ROOT + '/..');

module.exports = new spaghetti.EndState({
	
	name: 'redirectEnd',
	
	execute: function(context) {
		console.log('redirectEnd.execute');
		
		context.response.redirect('http://www.google.com');
	}
})