var q = require('q');

var Class = require('./class');

/**
 * Flow
 * ----
 *
 * This class represents an individual flow. It manages flow execution and resumption,
 * along with transitioning to different states, subflows, parent flows, etc.
 */

module.exports = Class.extend({
	
	// The name of the default state to enter into the flow with
	entryState: 'entry',
	
	// The name of the default state to return from the flow with
	returnState: 'return',
	
	
	/**
	 * Initialize our Flow
	 *
	 * Validate required fields
	 */
	init: function() {
		
		if (!this.name)
			throw 'Flow name required';
	},
	
	
	/**
	 * Execute state
	 *
	 * Execute the current state. This is called when we transition to a state.
	 *
	 * @param context : flow context
	 */
	execute: function(context) {
		return this.flowspec.getResolvedFrame(context).state.doExecute(context, this);
	},
	
	
	/**
	 * Resume state
	 *
	 * Resume the current state. This is called when the user POSTs from a view. As such
	 * this method will only ever call view states.
	 *
	 * @param context : flow context
	 */
	resume: function(context) {
		return this.flowspec.getResolvedFrame(context).state.doResume(context, this);
	},
	
	
	/**
	 * Transition state
	 *
	 * Transition from the current state using the transition key, using transitions defined
	 * in the flow definiton. Can do the following transitions:
	 *
	 * - Into another state in the same flow
	 * - Out of the current state and into the parent flow
	 * - Into a subflow
	 *
	 * @param context    : flow context
	 * @param transition : the transition name used to determine the next state
	 */
	transition: function(context, transition) {
		
		var stateName = this.flowspec.getFrame(context).state;
		
		var transitions = this.transitions[stateName];
		
		if (!transitions)
			throw 'No transitions found for state "' + stateName + '"';
		
		var next = transitions[transition];
		
		if (!next)
			throw 'Transition "' + transition + '" not found for state "' + stateName + '"';
		
		var qualifier;
		
		if (~next.indexOf(':'))
			next      = next.split(':'),
			qualifier = next[1],
			next      = next[0];
		
		// Return and resume the parent flow
		if (next === this.returnState && qualifier)
			return this.flowspec.returnFlow(context, qualifier);
		
		// Transition to another state in the same flow
		else if (this.flowspec.isState(next))
			return this.flowspec.enterState(context, next);
		
		// Transition into a subflow
		else if (this.flowspec.isFlow(next))
			return this.flowspec.enterFlow(context, next);
			
		else
			throw 'No state or flow found called "' + next + '"';
	},
	
	
	/**
	 * Get default state
	 *
	 * Get the default state defined in the user property `entryState`
	 */
	getDefaultState: function() {
		return this.flowspec.getState(this.entryState);
	},

})