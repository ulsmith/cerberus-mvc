'use strict';

const Middleware = require('cerberus-mvc/Base/Middleware');

/**
 * @module cerberus-mvc/Middleware/Amqp
 * @class Amqp
 * @extends Middleware
 * @description Middleware class providing Amqp DB connection handling on incomming event and outgoing response
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Amqp extends Middleware {

	/**
	 * @public @method start
	 * @description Invoke middleware for incoming request
	 * @param {Object} request The incoming request to API Gateway
	 */
	start(request) {
		// start DB connections to all postrgres DB's
		let services = [];
		for (const service in this.$services) {
			if (this.$services[service].name === 'amqp') {
				services.push(this.$services[service].connect().catch((error) => {
					console.log('Check ALL connection settings: ' + error.message, JSON.stringify(error.stack));
				}));
			}
		}

		return Promise.all(services).then(() => request);
	}

    /**
	 * @public @method end
	 * @description Invoke middleware for outgoing response
     * @param {Object} response The outgoing response to API Gateway
     */
	end(response) {
		// stop DB connections to all postrgres DB's
		let services = [];
		for (const service in this.$services) {
			if (this.$services[service].name === 'amqp') {
				services.push(this.$services[service].end().catch((error) => {
					console.log('Check ALL connection settings: ' + error.message, JSON.stringify(error.stack));
				}));
			}
		}

		return Promise.all(services).then(() => response);
	}
}

module.exports = Amqp;
