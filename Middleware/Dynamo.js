'use strict';

const Middleware = require('cerberus-mvc/Base/Middleware');

/**
 * @namespace MVC/Middleware
 * @class Dynamo
 * @extends Middleware
 * @description Middleware class providing Dynamo DB connection handling on incomming event and outgoing response
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Dynamo extends Middleware {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor() {
		super();
	}

	/**
	 * @public @method in
	 * @description Invoke middleware for incoming request
	 * @param {Object} request The incoming request to API Gateway
	 */
	in(request) {
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
