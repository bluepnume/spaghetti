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
	
	
	transition: function(context, transition) {
		
		var stateName = this.flowspec.getFrame(context).state;
		
		var transitions = this.transitions[stateName];
		
		if (!transitions)
			throw 'No transitions found for state "' + stateName + '"';
		
		var next = transitions[transition];
		
		if (!next)
			throw 'Transition "' + transition + '" not found for state "' + stateName + '"';
		
		if (next === this.returnState)
			return this.flowspec.returnFlow(context, transition);
		
		else if (this.flowspec.isState(next))
			return this.flowspec.enterState(context, next);
		
		else if (this.flowspec.isFlow(next))
			return this.flowspec.enterFlow(context, next);
			
		else
			throw 'No state or flow found called "' + next + '"';
	},
	
	getDefaultState: function() {
		return this.flowspec.getState(this.entryState);
	},

})