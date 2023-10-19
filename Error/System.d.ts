/**
 * @module cerberus-mvc/Error/System
 * @class System
 * @extends Error
 * @description System class to give extended error functionality as a rest error, for returning back to client
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
export default class System<T> extends Error {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 * @param {String} message The message to pass in as the error message
	 * @param {Mixed} details Any data to capture
	 * @param {string} logging logging: 'all' | 'error' | 'warning' | 'info' | 'none' 
	 */
	constructor(message: string, details: object, logging?: 'all' | 'error' | 'warning' | 'info' | 'none')
}