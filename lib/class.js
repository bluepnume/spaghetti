var util = require('util');
 
/**
 * Generate a new class
 * --------------------
 *
 * - When attached to an existing class, generates a new class
 *   which inherits from the prototype of the existing class
 *   
 * - Otherwise, generates a new, clean class.
 */
function generate() {
	
	// Create our class constructor
	function Class() {
		
		// Load any provided properties directly onto the object
		transposeArgs(arguments, this);
		
		// Call the init method of our new object, if it has one
		if (typeof this.init === 'function')
			this.init();
	}
	
	// Attach extend method to our new constructor
	Class.extend = generate;
	
	// If we're attached to a class then inherit from it
	if (this !== global)
		util.inherits(Class, this);
		
	// Load any provided properties onto the constructor's prototype
	transposeArgs(arguments, Class.prototype);
	
	return Class;
}
 
/**
 * Transpose args
 * --------------
 *
 * - Loads a variable number of arguments into a recipient object.
 * 
 * - Arguments should be a list of object with the desired properties
 *   to be transposed to the recipient
 */
function transposeArgs(args, recipient) {
	
	// Loop through all args
	for (var i=0; i<args.length; i++) {
		var ob = args[i];
		
		// Loop through all keys
		for (var key in ob) {
			
			// Transpose each property to the recipient
			if (ob.hasOwnProperty(key))
				recipient[key] = ob[key];
		}
	}
}
 
/**
 * Class
 * -----
 *
 * An initial class which can be extended elsewhere
 */
module.exports = generate();