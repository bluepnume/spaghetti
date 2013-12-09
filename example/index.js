global.EXAMPLE_ROOT = __dirname;

var express  = require('express');
var flowSpec = require('./flowspec');

var app = express();

app.all('/checkout',
	express.cookieParser(),	
	express.cookieSession({secret: 'foobar2000'}),
	express.bodyParser(),
	flowSpec.handler()
)

app.listen(8000);