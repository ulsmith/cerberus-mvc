'use strict';

const Middleware = require('cerberus-mvc/Base/Middleware');

/**
 * @namespace MVC/Middleware
 * @class Amqp
 * @extends Middleware
 * @description Middleware class providing Amqp DB connection handling on incomming event and outgoing response
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Amqp extends Middleware {

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
			if (this.$services[service].name === 'amqp') {
				services.push(this.$services[service].connect().catch((error) => {
					if (this.$environment.API_MODE === 'development') console.log('Check ALL connection settings: ' + error.message, JSON.stringify(error.stack));
				}));
			}
		}

		return Promise.all(services).then(() => request);
	}

    /**
	 * @public @method out
	 * @description Invoke middleware for outgoing response
     * @param {Object} response The outgoing response to API Gateway
     */
	out(response) {
		// stop DB connections to all postrgres DB's
		let services = [];
		for (const service in this.$services) {
			if (this.$services[service].name === 'amqp') {
				services.push(this.$services[service].end().catch((error) => {
					if (this.$environment.API_MODE === 'development') console.log('Check ALL connection settings: ' + error.message, JSON.stringify(error.stack));
				}));
			}
		}

		return Promise.all(services).then(() => response);
	}
}

module.exports = Amqp;
