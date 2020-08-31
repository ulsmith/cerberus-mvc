'use strict';

/**
 * @namespace MVC/System
 * @class Core
 * @description System class to give a base for all system classes, such as services, models, controllers
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
class Core {

	/**
	 * @public @get environment
	 * @desciption Get the environment data available to the system
	 * @return {Object} Middleware available
	 */
	get $environment() { return process.__environment }

	/**
	 * @public @get client
	 * @desciption Get the client data available to the system
	 * @return {Object} Middleware available
	 */
	get $client() { return process.__client }

	/**
	 * @public @get services
	 * @desciption Get the services available to the system
	 * @return {Object} Services available
	 */
	get $services() { return process.__services }
}

module.exports = Core;
