
var q  = require('q');
var fs = require('fs');

var spaghetti = require(EXAMPLE_ROOT + '/..');

module.exports = spaghetti.ViewState.extend({
	
	actionParam: '_eventId',
	
	render: function(context) {
		
		if (!this.template)
			throw 'No template provided for view state "' + this.name + '"';
		
		return q.ninvoke(fs, 'readFile', EXAMPLE_ROOT + '/templates/' + this.template + '.htm', 'utf8').then(function(result) {
			context.response.send(result);
		})
	}
})