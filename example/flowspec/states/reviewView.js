
var ViewState = require(EXAMPLE_ROOT + '/flowspec/viewstate');

module.exports = new ViewState({
	
	name: 'reviewView',
	template: 'review',
	
	execute: function(context) {
		console.log('reviewView.execute');
	},
	
	actions: {
		submit: function(context) {
			return 'success'
		}
	}
})