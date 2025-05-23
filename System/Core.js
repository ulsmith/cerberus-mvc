'use strict';

/**
 * @module cerberus-mvc/System/Core
 * @class Core
 * @description System class to give a base for all system classes, such as services, models, controllers
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
class Core {
	constructor(globals) {
		if (!globals) throw new Error('Must pass in globals object from application to all classes that extend core, to enable access to environment, services, client, socket and io etc');
		
		this.globals = globals;
	}

	/**
	 * @public @get environment
	 * @desciption Get the environment data available to the system
	 * @return {Object} Middleware available
	 */
	get $globals() { return this.globals }

	/**
	 * @public @get environment
	 * @desciption Get the environment data available to the system
	 * @return {Object} Middleware available
	 */
	get $environment() { return this.globals.$environment }

	/**
	 * @public @get client
	 * @desciption Get the client data available to the system
	 * @return {Object} Middleware available
	 */
	get $client() { return this.globals.$client }

	/**
	 * @public @get services
	 * @desciption Get the services available to the system
	 * @return {Object} Services available
	 */
	get $services() { return this.globals.$services }

	/**
	 * @public @get socket
	 * @desciption Get the socket available to the system
	 * @return {Object} socket available
	 */
	get $socket() { return this.globals.$socket }

	/**
	 * @public @get io
	 * @desciption Get the io available to the system
	 * @return {Object} io available
	 */
	get $io() { return this.globals.$io }
}

module.exports = Core;
