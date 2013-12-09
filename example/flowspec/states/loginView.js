
var q = require('q');
var ViewState = require(EXAMPLE_ROOT + '/flowspec/viewstate');

module.exports = new ViewState({
	
	name: 'loginView',
	
	
	// Let's provide our view state with a template to render.
	
	template: 'login',
	
	
	// Since we're in a flow state, our execute method doesn't need to return anything. After execute we'll
	// do a render.
	// Naturally this method CAN return a promise if it wants to do some async stuff. But the return value
	// will be ignored, since it doesn't really make sense to transition out of a view state before we render.
	
	execute: function(context) {
		console.log('loginView.execute');
	},
	
	
	// Here we define some user actions. The view state handles these actions THEN returns a transition
	// for the flow engine to handle. This avoids having multiple states e.g. LoginView + LoginAction, and
	// also means we can handle *user-actions* and *flow-transitions* in _different_ places (not a fan of the
	// spring approach for this which lumps the two together)
	
	actions: {
		
		login: function(context) {
			return q('success').delay(500);
		},
		
		redirect: function() {
			return q('redirect').delay(500);
		}
	}
})