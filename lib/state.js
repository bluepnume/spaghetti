var Class = require('./class');
var FlowSpec = require('./flowspec');

/**
 * State
 * -----
 *
 * This class represents an individual state. It manages state execution
 * and resumption. This is an abstract class with some barebones functionality,
 * and should not be instantiated directly.
 */

module.exports = Class.extend({
	
	/**
	 * Init
	 *
	 * Validate the required state user properties
	 */
	init: function() {
		
		if (!this.name)
			throw 'State name required';
		
		if (typeof this.execute !== 'function')
			throw 'State "' + this.name + '" execute method required';
	},
	
	/**
	 * Execute
	 *
	 * Run the execute method defined by the user
	 *
	 * @param context : flow context
	 * @param flow    : the flow executing the current state
	 */
	doExecute: function(context, flow) {
		return q.invoke(this, 'execute', context);
	},
	
	/**
	 * Resume
	 *
	 * Defaults to running doExecute
	 *
	 * @param context : flow context
	 * @param flow    : the flow executing the current state
	 */
	doResume: function(context, flow) {
		return this.doExecute(flow, context);
	}
})