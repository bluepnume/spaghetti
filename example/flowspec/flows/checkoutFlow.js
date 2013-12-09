
var spaghetti = require(EXAMPLE_ROOT + '/..');

module.exports = new spaghetti.Flow({
	
	name: 'checkoutFlow',
	entryState: 'loginView',
	
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