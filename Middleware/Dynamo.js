'use strict';

const Middleware = require('cerberus-mvc/Base/Middleware');

/**
 * @module cerberus-mvc/Middleware/Dynamo
 * @class Dynamo
 * @extends Middleware
 * @description Middleware class providing Dynamo DB connection handling on incomming event and outgoing response
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Dynamo extends Middleware {

	/**
	 * @public @method start
	 * @description Invoke middleware for incoming request
	 * @param {Object} request The incoming request to API Gateway
	 */
	start(request) {
		// start DB connections to all postrgres DB's
		let services = [];
		for (const service in this.$services) {
			if (this.$services[service].name === 'dynamo') {
				services.push(this.$services[service]);
			}
		}

		return Promise.all(services).then(() => request);
	}
}

module.exports = Dynamo;
