var q = require('q');

var Class = require('./class');

module.exports = Class.extend({
	
	flows: {},
	
	entryState: 'entry',
	returnState: 'return',
	
	init: function() {
		
		if (!this.name)
			throw 'Flow name required';
	},
	
	
	execute: function(context) {
		return this.flowspec.getResolvedFrame(context).state.doExecute(context, this);
	},
	
	resume: function(context) {
		return this.flowspec.getResolvedFrame(context).state.doResume(context, this);
	},
	
	
	transition: function(context, stateName, transition) {
		
		var transitions = this.transitions[stateName];
		
		if (!transitions)
			throw 'No transitions found for state "' + stateName + '"';
		
		var next = transitions[transition];
		
		if (!next)
			throw 'Transition "' + transition + '" not found for state "' + stateName + '"';
		
		if (next === this.returnState)
			return this.flowspec.returnFlow(context, transition);
		
		else if (this.flowspec.isState(next))
			return this.flowspec.changeState(context, next);
		
		else if (this.flowspec.isFlow(next))
			return this.flowspec.enterFlow(context, next);
			
		else
			throw 'No state or flow found called "' + next + '"';
	},
	
	getDefaultState: function() {
		
		var stateName = this.entryState;
		
		if (!stateName)
			throw 'No default state provided for flow "' + this.name + '"';
		
		var state = this.flowspec.states[stateName];
		
		if (!state)
			throw 'No state found with name "' + stateName + '"';
		
		return state;
	},

})