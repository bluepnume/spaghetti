
var q  = require('q');
var fs = require('fs');

var spaghetti = require(EXAMPLE_ROOT + '/..');


// Implement our own view state.
// This allows us to configure and implement things which our flow engine should really have no knowledge of.

module.exports = spaghetti.ViewState.extend({
	
	// Specify a custom action parameter. So now in our html we need to use e.g.
	// <button name="_eventId" value="login">Log me in!</button>
	
	actionParam: '_eventId',
	
	// Implement our own render method.
	// For now let's just grab some html from our templates folder and dump it in the response.
	
	render: function(context) {
		
		if (!this.template)
			throw 'No template provided for view state "' + this.name + '"';
		
		return q.ninvoke(fs, 'readFile', EXAMPLE_ROOT + '/templates/' + this.template + '.htm', 'utf8').then(function(result) {
			context.response.send(result);
		})
	}
})