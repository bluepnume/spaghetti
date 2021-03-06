
// Let's set up a little example express app.
// Most of this is fairly standard stuff, with a little bit of spaghetti integration.

global.EXAMPLE_ROOT = __dirname;

var express  = require('express');
var flowSpec = require('./flowspec');

var app = express();

app.all('/checkout',
	express.cookieParser(),	
	express.cookieSession({secret: 'foobar2000'}),
	express.bodyParser(),
    
    // Generate some middleware for our flow spec
	flowSpec.handler()
)

app.listen(8000);