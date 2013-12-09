var q = require('q');

var State = require('./state');

/**
 * Action State
 * ------------
 *
 * Action states should be used for intermediary controller steps, that don't
 * fit neatly into view states, or for functionality that can be reused in different
 * flows.
 */

module.exports = State.extend({
	
	/**
	 * Execute
	 *
	 * Call the user-defined `execute` method, and transition to the next state
	 * using the transition returned
	 *
	 * @param context : flow context
	 * @param flow    : the flow executing the current state
	 */
	doExecute: function(context, flow) {
		return q.invoke(this, 'execute', context).then(function(transition) {
			
			if (!transition)
				throw 'No transition returned for "' + this.name + '" execution';
			
			return flow.transition(context, transition);
		
		}.bind(this));
	}
	
})