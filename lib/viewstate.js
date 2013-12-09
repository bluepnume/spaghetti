var q = require('q')

var State = require('./state');

/**
 * Action State
 * ------------
 *
 * View states should be used for setting up and rendering a view, then handling
 * any user actions from the front-end.
 */

module.exports = State.extend({
	
	// The form parameter used to determine which user-action has been called
	actionParam: 'action',
	
	// The template name to render
	template: '',
	
	/**
	 * Execute
	 *
	 * Call the user-defined `execute` method, then call the user-defined `render` method.
	 *
	 * @param context : flow context
	 * @param flow    : the flow executing the current state
	 */
	doExecute: function(context, flow) {
		
		return q.invoke(this, 'execute', context).then(function() {
			return q.try(this.render.bind(this), context);
		}.bind(this));
	},
	
	/**
	 * Resume
	 *
	 * Resume a view state after a user POST. Dispatched any user action to the
	 * appropriate handler, defined in `actions`. The action then returns a transition,
	 * which is used to transition to the next state.
	 *
	 * @param context : flow context
	 * @param flow    : the flow executing the current state
	 */
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
	
	/**
	 * Render
	 *
	 * Render the view. This is a barebones method and should be implemented
	 * by extending the ViewState class.
	 *
	 * @param context : flow context
	 */
	render: function(context) {
		context.response.send('view: ' + this.name);
	}
	
})