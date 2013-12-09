
var ViewState = require(EXAMPLE_ROOT + '/flowspec/viewstate');

module.exports = new ViewState({
	
	name: 'doneView',
	template: 'done',
	
	execute: function(context) {
		console.log('doneView.execute');
	},
	
	actions: {

	}
})