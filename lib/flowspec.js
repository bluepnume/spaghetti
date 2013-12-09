var q = require('q');

var util = require('./util')
var Class = require('./class');

module.exports = Class.extend({
	
	flows: {},
	states: {},
	
	init: function() {
		
		if (!this.flowPath)
			throw 'No flowPath set';
		
		if (!this.errorState)
			throw 'No errorState set';
		
		this.requireAll(this.flowPath, this.flows);
		this.requireAll(this.statePath, this.states);
	},
	
	requireAll: function(path, collection) {
		
		util.recursiveRequire(path, function(item) {
			
			if (collection[item.name])
				throw '"' + item.name + '" already registered';
			
			item.flowspec = this;
			collection[item.name] = item;
			
		}.bind(this));
	},
	
	handler: function() {
		
		return function(req, res, next) {
			
			var context = this.getContext(req, res);
			this.initStack(context);
			return this.handle(context, true);
		
		}.bind(this);
	},
	
	handle: function(context, isNew) {
		
		return q.try(function() {
			
			var flow  = this.getResolvedFrame(context).flow;
			
			if (context.request.method === 'POST' && !isNew)
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
	
	getSession: function(context) {
		var session = context.request.session;
		
		if (!session)
			throw 'Session not found';
		
		return session;
	},
	
	initStack: function(context) {
		
		var session = this.getSession(context);
		
		if (context.request.method === 'GET' || !session.flowStack)
			session.flowStack = [];
			
		this.pushFrame(context);
	},
	
	getStack: function(context) {
		var session = this.getSession(context);
		return session.flowStack;
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
	
	pushFrame: function(context, flowName) {
		
		if (!flowName)
			flowName = this.getDefaultFlow().name;
			
		var flow  = this.getFlow(flowName);
		var state = flow.getDefaultState();
		
		var session = this.getSession(context);
		
		session.flowStack.push({
			flow:  flow.name,
			state: state.name
		});
	},
	

	
	popStack: function(context) {
		this.getStack(context).pop();
	},
	
	enterFlow: function(context, flowName) {
		
		this.getFrame(context).state = flowName;
		
		this.pushFrame(context, flowName);
		
		return this.handle(context);
	},
	
	returnFlow: function(context, transition) {

		this.popStack(context);
		
		var frame = this.getResolvedFrame(context);

		return frame.flow.transition(context, transition);
	},
	
	changeState: function(context, stateName) {
		
		if (!this.states[stateName])
			throw 'State "' + stateName + '" not found';
		
		this.getFrame(context).state = stateName;

		return this.handle(context);
	},
	
	getDefaultFlow: function() {
		
		var flowName = this.entryFlow;
		
		if (!flowName)
			throw 'No default flow provided';
		
		var flow = this.flows[flowName];
		
		if (!flow)
			throw 'No flow found with name "' + flowName + '"';
		
		return flow;
	},
	
	getContext: function(req, res) {
		
		var context = req.context;
		
		if (!context)
			context = req.context = {
				request: req,
				response: res,
				data: {}
			};
			
		return context;
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