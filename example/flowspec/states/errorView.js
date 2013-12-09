
var ViewState = require(EXAMPLE_ROOT + '/flowspec/viewstate');

module.exports = new ViewState({
	
	name: 'errorView',
	template: 'error',
	
	execute: function(context) {
		console.log('errorView.execute');
	}
})