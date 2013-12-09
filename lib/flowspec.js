var q = require('q');

var util = require('./util')
var Class = require('./class');


/**
 * FlowSpec
 * --------
 *
 * This is the primary controller for the flow. It creates request middleware,
 * dispatches between flows and states, and manages error handling
 */

module.exports = Class.extend({
	
	/**
	 * Initialize our FlowSpec
	 *
	 * Rather than have users manually require all of their flows and states,
	 * they can provide a flowPath and statePath which we will recursively loop
	 * through and require all modules found.
	 */
	init: function() {
		
		if (!this.flowPath)
			throw 'No flowPath set';
		
		if (!this.errorState)
			throw 'No errorState set';
		
		this.autoload(this.modules);
	},
	
	/**
	 * Modules we want to auto-load into collections
	 *
	 * Rather than have users manually require all of their flows and states,
	 * they can provide a flowPath and statePath which we will recursively loop
	 * through and require all modules found.
	 */
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
	
	/**
	 * Autoload modules
	 *
	 * Recursively scan through directories and load modules into the specified collection
	 *
	 * @param modules : A list of objects, representing modules to autoload
	 */
	autoload: function(modules) {
		modules.forEach(function(module) {
			
			var collection = this[module.collection] = {};
			
			util.recursiveRequire(this[module.path], function(item) {
				
				if (collection[item.name])
					throw '"' + item.name + '" already registered';
				
				item.flowspec = this;
				collection[item.name] = item;
				
			}.bind(this));
		}.bind(this));
	},
	
	/**
	 * Create handler
	 *
	 * Generate a request handler method, which can act as middleware in express.
	 */
	handler: function() {
		
		return function(req, res, next) {
			
			return q.try(function() {
				var context = this.getContext(req, res);
				
				// Reset the flow execution stack for the initial request
				if (req.method === 'GET')
					this.resetStack(context);
					
				// Start handling our flow
				return this.handle(context, true);
			
			}.bind(this));
		}.bind(this);
	},
	
	/**
	 * Handle the flow
	 *
	 * Picks up the flow at whatever point we left of (dictated by session) and
	 * handles any errors, by first attempting to execute the specified error state,
	 * and failing that by sending a basic 500 error response
	 *
	 * @param context : flow context
	 * @param first   : flag to indicate if we are the first handle for the request
	 */
	handle: function(context, first) {
		
		return q.try(function() {
			
			var flow  = this.getResolvedFrame(context).flow;
			
			// If this is the first handle-call, and it's a POST, we should
			// resume the existing flow (in this case we will have a view state,
			// so we don't want to execute and render again)
			if (context.request.method === 'POST' && first)
				return flow.resume(context);
			
			// Otherwise we have already resumed the flow, we can continue execution
			else
				return flow.execute(context);
			
		}.bind(this)).catch(function(err) {
			
			// Handle any errors resulting from our flow execution
			
			// First log the error
			var frame = this.getFrame(context)
			console.error('\n\n', frame.flow, '::', frame.state, '\n\n', err.stack || err, '\n\n');
			
			// First thing to check -- are we currently in the error state? If so, we've tried to
			// handle the error gracefully by going to the error state, but something has gone wrong.
			// In this case all we can do is send a basic 500 error response.
			if (frame.state === this.errorState)
				return context.response.send(500, 'Internal Server Error');
				
			// Otherwise, let's try entering the provided error state for the first time.
			return this.enterState(context, this.errorState);
			
		}.bind(this))
	},
	
	/**
	 * Enter a new flow
	 *
	 * Add a new flow to the flow-stack, and resume handling
	 *
	 * @param context  : flow context
	 * @param flowName : the name of the flow to enter
	 */
	enterFlow: function(context, flowName) {
		
		this.getFrame(context).state = flowName;	
		this.pushFlow(context, flowName);
		return this.handle(context);
	},
	
	/**
	 * Return from a flow
	 *
	 * Pop the current flow from the flow-stack, and resume handling
	 *
	 * @param context    : flow context
	 * @param transition : the transition returned from the subflow, to run on the parent flow
	 */
	returnFlow: function(context, transition) {

		this.getStack(context).pop();
		var frame = this.getResolvedFrame(context);
		return frame.flow.transition(context, transition);
	},
	
	/**
	 * Enter a new state
	 *
	 * Switch to a new state in the current flow, and resume handling
	 *
	 * @param context   : flow context
	 * @param stateName : the name of the state to enter
	 */
	enterState: function(context, stateName) {
		
		this.getFrame(context).state = this.getState(stateName).name;
		return this.handle(context);
	},
	
	
	/**
	 * Get session
	 *
	 * Get the session for the current request, and fail if it has not been created
	 *
	 * @param context : flow context
	 */
	getSession: function(context) {
		var session = context.request.session;
		
		if (!session)
			throw 'Session not found';
		
		return session;
	},

	
	/**
	 * Get stack
	 *
	 * Get the flow-stack from the session, or create it if it doesn't yet exist.
	 * If it's empty, insert the default flow
	 *
	 * The flow stack is a list of objects representing the hierarchy of flows currently
	 * being executed, e.g.
	 *
	 * [
	 *     {
	 *        flow:  'checkoutFlow',
	 *        state: 'memberFlow'
	 *     },
	 *
	 *     {
	 *        flow:  'memberFlow',
	 *        state: 'reviewView'
	 *     }
	 * ]
	 *
	 * @param context : flow context
	 */
	getStack: function(context) {
		var session = this.getSession(context);
		
		if (!session.flowStack)
			session.flowStack = [];
		
		if (!session.flowStack.length)
			this.pushFlow(context, this.getDefaultFlow().name);
		
		return session.flowStack;
	},
	
	/**
	 * Reset stack
	 *
	 * Kill the stack, and recreate an empty one
	 *
	 * @param context : flow context
	 */
	resetStack: function(context) {
		
		var session = this.getSession(context);
		session.flowStack = [];
	},
	
	/**
	 * Get frame
	 *
	 * Get the current execution frame. The frame contains the current flow,
	 * and the current state, e.g.
	 *
	 * {
	 *    flow:  'memberFlow',
	 *    state: 'reviewView'
	 * }
	 *
	 * @param context : flow context
	 */
	getFrame: function(context) {
		
		var stack = this.getStack(context);
		var frame = stack[stack.length - 1];
		
		// If we don't have a flow name, set the default flow for the flow spec
		if (!frame.flow)
			frame.flow = this.getDefaultFlow().name;
			
		// If we don't have a state name, set the default state for the flow
		if (!frame.state)
			frame.state = this.flows[frame.flow].getDefaultState().name;
			
		return frame;
	},
	
	/**
	 * Get resolved frame
	 *
	 * This returns the current execution frame, with the flow and state
	 * resolved from string names to Flow and State objects
	 *
	 * @param context : flow context
	 */
	getResolvedFrame: function(context) {
		
		var frame = this.getFrame(context);
		
		return {
			flow:  this.getFlow(frame.flow),
			state: this.getState(frame.state)
		}
	},
	
	/**
	 * Push a new flow
	 *
	 * Push a flow with the given name into the flow-stack.
	 *
	 * @param context  : flow context
	 * @param flowName : the name of the flow to push into the stack
	 */
	pushFlow: function(context, flowName) {
		
		var flow  = this.getFlow(flowName);
		var state = flow.getDefaultState();
		
		var session = this.getSession(context);
		
		session.flowStack.push({
			flow:  flow.name,
			state: state.name
		});
	},
	
	/**
	 * Get default flow
	 *
	 * Get the default flow object, specified by the `entryFlow` user defined property
	 */
	getDefaultFlow: function() {
		return this.getFlow(this.entryFlow);
	},
	
	/**
	 * Get flow context
	 *
	 * Get a flow context object containing request, response and data objects.
	 * Create and attach to request if it does not already exist
	 *
	 * @param req : http request
	 * @param res : http response
	 */
	getContext: function(req, res) {
		
		return req.context ? req.context : req.context = {
			request: req,
			response: res,
			data: {}
		};
	},
	
	/**
	 * Check if Flow
	 *
	 * Determine if the given flow name is actually a valid flow
	 *
	 * @param flowName : the flow name to check
	 */
	isFlow: function(flowName) {
		return Boolean(flowName && this.flows[flowName]);
	},
	
	
	/**
	 * Get Flow by name
	 *
	 * Get a flow object given its name
	 *
	 * @param flowName : the flow name to resolve
	 */
	getFlow: function(flowName) {
		
		if (!flowName)
			throw 'No flowName provided';
			
		var flow = this.flows[flowName];
		
		if (!flow)
			throw 'No flow found with name "' + flowName + '"';
		
		return flow;
	},
	
	
	/**
	 * Check if State
	 *
	 * Determine if the given state name is actually a valid state
	 *
	 * @param stateName : the state name to check
	 */
	isState: function(stateName) {
		return Boolean(stateName && this.states[stateName]);
	},
	
	
	/**
	 * Get State by name
	 *
	 * Get a state object given its name
	 *
	 * @param stateName : the state name to resolve
	 */
	getState: function(stateName) {
		
		if (!stateName)
			throw 'No stateName provided';
			
		var state = this.states[stateName] || this.flows[stateName];
		
		if (!state)
			throw 'No state found with name "' + stateName + '"' + console.trace();
		
		return state;
	}
})