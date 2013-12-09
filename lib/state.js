var Class = require('./class');
var FlowSpec = require('./flowspec');

module.exports = Class.extend({
	
	states: {},
	
	init: function() {
		
		if (!this.name)
			throw 'State name required';
		
		if (typeof this.execute !== 'function')
			throw 'State "' + this.name + '" execute method required';
	},
	
	doExecute: function(context, flow) {
		return q.invoke(this, 'execute', context);
	},
	
	doResume: function(context, flow) {
		return this.doExecute(flow, context);
	}
})