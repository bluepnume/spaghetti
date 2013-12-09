var dive = require('dive');

/**
 * util
 * ----
 *
 * Utility methods that don't fit in elsewhere
 */

module.exports = {
    
    /**
     * Recursive require
     *
     * Loop recursively through a path, require any files that are found,
     * and send them back to caller via callback
     *
     * @param path     : the path to search for files to require
     * @param callback : the callback to call with required files
     */
    recursiveRequire: function(path, callback) {
		
		dive(path, function(err, file) {
			callback(require(file));
		}.bind(this))
	},
}