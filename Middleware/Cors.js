'use strict';

const Middleware = require('../Base/Middleware');

/**
 * @namespace MVC/Middleware
 * @class Cors
 * @extends Middleware
 * @description Middleware class providing cors patching to outgoing response
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Cors extends Middleware {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor() {
		super();
	}

    /**
	 * @public @method out
	 * @description Invoke middleware for outgoing response
     * @param {Object} response The outgoing response to API Gateway
     * @param {Object} context The lambda context
     */
	out(response) {
		// update headers on way back out, for all requests that are not options (handled by API gateway directly)
		response.headers['Access-Control-Allow-Origin'] = this.$client.origin;
		response.headers['Access-Control-Allow-Credentials'] = 'true';
		response.headers['Access-Control-Allow-Headers'] = 'Accept, Cache-Control, Content-Type, Content-Length, Authorization, Pragma, Expires, Api-Key, Accept-Encoding';
		response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
		response.headers['Access-Control-Expose-Headers'] = 'Cache-Control, Content-Type, Authorization, Pragma, Expires';

		return response;
	}
}

module.exports = Cors;