
var q = require('q');
var ViewState = require(EXAMPLE_ROOT + '/flowspec/viewstate');

module.exports = new ViewState({
	
	name: 'loginView',
	template: 'login',
	
	execute: function() {
		console.log('loginView.execute');
	},
	
	actions: {
		
		login: function(context) {
			return q('success').delay(500);
		},
		
		redirect: function() {
			return q('redirect').delay(500);
		}
	}
})