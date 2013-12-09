var q = require('q')

var State = require('./state');

/**
 * End State
 * ---------
 *
 * End States should be used for finalizing a flow, then redirecting elsewhere or
 * returning a final response, e.g. a JSON object instructing the front end to
 * change window.location
 */

module.exports = State.extend({
	
})