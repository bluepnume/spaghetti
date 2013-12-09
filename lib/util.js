var dive = require('dive');

module.exports = {
    
    recursiveRequire: function(path, callback) {
		
		dive(path, function(err, file) {
			callback(require(file));
		}.bind(this))
	},
}