'use strict';

const Middleware = require('../Base/Middleware');

/**
 * @namespace API/Middleware
 * @class Knex
 * @extends Middleware
 * @description Middleware class providing knex DB connection handling on incomming event and outgoing response
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Knex extends Middleware {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor() {
		super();
	}

    /**
	 * @public @method end
	 * @description Invoke middleware for outgoing response
     * @param {Object} response The outgoing response to API Gateway
     * @param {Object} context The lambda context
     */
	end(response) {
		let services = [];
		for (const service in this.$services) {
			if (this.$services[service].name === 'knex') {
				services.push(this.$services[service].destroy().catch((error) => {
					console.log('Check ALL connection settings: ' + error.message, JSON.stringify(error.stack));
				}));
			}
		}

		return Promise.all(services).then(() => response);
	}
}

module.exports = Knex;
