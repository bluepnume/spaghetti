var q = require('q');

var State = require('./state');

module.exports = State.extend({
	
	doExecute: function(context, flow) {
		return q.invoke(this, 'execute', context).then(function(transition) {
			
			if (!transition)
				throw 'No transition returned for "' + this.name + '" execution';
			
			return flow.transition(context, this.name, transition);
		
		}.bind(this));
	}
	
})