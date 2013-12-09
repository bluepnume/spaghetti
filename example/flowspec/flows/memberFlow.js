
var spaghetti = require(EXAMPLE_ROOT + '/..');

module.exports = new spaghetti.Flow({
	
	name: 'memberFlow',
	entryState: 'reviewView',
	
	transitions: {
		
		reviewView: {
			success: 'return',
		}
	}
})