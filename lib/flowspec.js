var q = require('q');

var util = require('./util')
var Class = require('./class');

module.exports = Class.extend({
	
	modules: [
		{
			path: 'flowPath',
			collection: 'flows'
		},
		
		{
			path: 'statePath',
			collection: 'states'
		}
	],

	init: function() {
		
		if (!this.flowPath)
			throw 'No flowPath set';
		
		if (!this.errorState)
			throw 'No errorState set';
		
		this.autoload();
	},
	
	autoload: function() {
		this.modules.forEach(function(module) {
			
			var collection = this[module.collection] = {};
			
			util.recursiveRequire(this[module.path], function(item) {
				
				if (collection[item.name])
					throw '"' + item.name + '" already registered';
				
				item.flowspec = this;
				collection[item.name] = item;
				
			}.bind(this));
		}.bind(this));
	},
	
	handler: function() {
		
		return function(req, res, next) {
			
			return q.try(function() {
				
				var context = this.getContext(req, res);
				
				if (req.method === 'GET')
					this.resetStack(context);
					
				return this.handle(context, true);
			
			}.bind(this));
		
		}.bind(this);
	},
	
	handle: function(context, first) {
		
		return q.try(function() {
			
			var flow  = this.getResolvedFrame(context).flow;
			
			if (context.request.method === 'POST' && first)
				return flow.resume(context);
			else
				return flow.execute(context);
			
		}.bind(this)).catch(function(err) {
			
			var frame = this.getFrame(context)
			console.error('\n\n', frame.flow, '::', frame.state, '\n\n', err.stack || err, '\n\n');
			
			if (frame.state === this.errorState)
				return context.response.send(500, 'Internal Server Error');
				
			return this.changeState(context, this.errorState);
			
		}.bind(this))
	},
	
	enterFlow: function(context, flowName) {
		
		this.getFrame(context).state = flowName;	
		this.pushFlow(context, flowName);
		return this.handle(context);
	},
	
	returnFlow: function(context, transition) {

		this.getStack(context).pop();
		var frame = this.getResolvedFrame(context);
		return frame.flow.transition(context, transition);
	},
	
	changeState: function(context, stateName) {
		
		this.getFrame(context).state = this.getState(stateName).name;
		return this.handle(context);
	},
	
	
	
	getSession: function(context) {
		var session = context.request.session;
		
		if (!session)
			throw 'Session not found';
		
		return session;
	},

	getStack: function(context) {
		var session = this.getSession(context);
		
		if (!session.flowStack)
			session.flowStack = [];
		
		if (!session.flowStack.length)
			this.pushFlow(context, this.getDefaultFlow().name);
		
		return session.flowStack;
	},
	
	resetStack: function(context) {
		
		var session = this.getSession(context);
		session.flowStack = [];
	},
	
	getFrame: function(context) {
		
		var stack = this.getStack(context);
		var frame = stack[stack.length - 1];
		
		if (!frame.flow)
			frame.flow = this.getDefaultFlow().name;
			
		if (!frame.state)
			frame.state = this.flows[frame.flow].getDefaultState().name;
			
		return frame;
	},
	
	getResolvedFrame: function(context) {
		
		var frame = this.getFrame(context);
		
		return {
			flow:  this.getFlow(frame.flow),
			state: this.getState(frame.state)
		}
	},
	
	pushFlow: function(context, flowName) {
		
		var flow  = this.getFlow(flowName);
		var state = flow.getDefaultState();
		
		var session = this.getSession(context);
		
		session.flowStack.push({
			flow:  flow.name,
			state: state.name
		});
	},
	
	
	
	getDefaultFlow: function() {
		return this.getFlow(this.entryFlow);
	},
	
	getContext: function(req, res) {
		
		return req.context ? req.context : req.context = {
			request: req,
			response: res,
			data: {}
		};
	},
	
	isFlow: function(flowName) {
		return Boolean(flowName && this.flows[flowName]);
	},
	
	getFlow: function(flowName) {
		
		if (!flowName)
			throw 'No flowName provided';
			
		var flow = this.flows[flowName];
		
		if (!flow)
			throw 'No flow found with name "' + flowName + '"';
		
		return flow;
	},
	
	isState: function(stateName) {
		return Boolean(stateName && this.states[stateName]);
	},
	
	getState: function(stateName) {
		
		if (!stateName)
			throw 'No stateName provided';
			
		var state = this.states[stateName] || this.flows[stateName];
		
		if (!state)
			throw 'No state found with name "' + stateName + '"' + console.trace();
		
		return state;
	}
})