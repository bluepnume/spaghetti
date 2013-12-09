var q = require('q')

var State = require('./state');

module.exports = State.extend({
	
	actionParam: 'action',
	
	doExecute: function(context, flow) {
		
		return q.invoke(this, 'execute', context).then(function() {
			return q.try(this.render.bind(this), context);
		}.bind(this));
	},
	
	doResume: function(context, flow) {
		
		var actionName = context.request.body[this.actionParam];
		
		if (!this.actions)
			throw 'No actions found for view state "' + this.name + '"';
		
		var action = this.actions[actionName];
		
		if (!action)
			throw 'Action "' + actionName + '" not found for view state "' + this.name + '"';
		
		return q.try(action.bind(this)).then(function(transition) {
			
			if (!transition)
				throw 'No transition returned for action "' + actionName + '" in view state "' + this.name + '"';
			
			return flow.transition(context, transition);
		
		}.bind(this));
	},
	
	render: function(context) {
		context.response.send('view: ' + this.name);
	}
	
})