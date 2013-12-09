
Spaghetti
---------

Flow engine inspired by spring webflow.

Install
-------

    npm install
    
Example App
-----------

    cd example
	npm install
    node .
    
Getting Started
---------------

### Create a FlowSpec

The FlowSpec is your flow's main controller; this will handle your dispatching, subflows, error handling, etc.

By convention, this lives in `/flowspec/index.js`:

    var spaghetti = require('spaghetti');

    module.exports = new spaghetti.FlowSpec({
        
        // Specify the absolute paths of your flows and states directories. These will be auto-loaded
        flowPath:  __dirname + '/flows',
        statePath: __dirname + '/states',
        
        // Specify the first flow you want to run for the initial request
        entryFlow: 'checkoutFlow',
        
        // Specify a ViewState to execute and render for any unhandled errors
        errorState: 'errorView'
    });
    
    
### Include in your application middleware

This will allow spaghetti to latch onto the request, and manage your web flow.

    var flowSpec = require('./flowspec');
    
    var app = express();
    
    app.all('/checkout',
    
        // Session middleware of some kind is required for spaghetti to track flow state
        express.cookieParser(),	
        express.cookieSession({secret: 'foobar2000'}),
        express.bodyParser(),
        
        // Here we generate some middleware for our flow spec
        flowSpec.handler()
    )
    
    app.listen(8000);
    
    
### Create some flow definitions

These are the controllers for each individual web flow; they manage the transitions between each individual flow state.

By convention, these live in `/flowspec/flows/`:

    var spaghetti = require('spaghetti');

    module.exports = new spaghetti.Flow({
        
        // The name of your web flow
        name: 'checkoutFlow',
        
        // The first state to enter
        entryState: 'loginView',
        
        // The transitions for your webflow: on loginView success, go to loadUserAction, etc.
        transitions: {
            
            loginView: {
                success:  'loadUserAction',
                redirect: 'redirectEnd',
                failed:   'loginView'
            },
            
            loadUserAction: {
                success: 'memberFlow'
            },
            
            memberFlow: {
                success: 'doneView'
            }
        }
    })


### Create some flow states

These are the individual states that make up your flow. The most common two are `ViewStates` and `ActionStates`.

`ViewStates` are your inidividual pages, e.g. 'Login' or 'Review', while `ActionStates` are your intermediary steps, e.g 'LoadUser'.

By convention, these live in `/flowspec/states/`:

    var spaghetti = require('spaghetti');

    module.exports = new spaghetti.ViewState({
        
        // The name of your state
        name: 'loginView',
        
        // The template to render
        template: 'login',
        
        // Set up your view before rendering
        execute: function(context) {
            console.log('loginView.execute');
        },
        
        // Handle any user actions from the front end
        actions: {
            
            login: function(context) {
                
                // Here we return a promise, which ultimately resolved to the the 'success' transition
                return authHandler.login(context.request.body.password).then(function() {
                    return 'success'
                });
            },
            
            redirect: function() {
                
                // Here we pass back a transition immediately
                return 'redirect';
            }
        }
    })


    var spaghetti = require('spaghetti');
    
    module.exports = new spaghetti.ActionState({
        
        // The name of your state
        name: 'loadUserAction',
        
        // Execute your action state, and return the next transition
        execute: function(context) {
            
            return userLib.loadUser(context.user).then(function() {
            
                return 'success';
                
            }).except(function() {
            
                return 'error';
            })
        },
    })
    
    
### Load up your server

You're good to go!