/**
 * @module cerberus-mvc/Error/Model
 * @class Model
 * @extends Error
 * @description Model class to give extended error functionality as a rest error, for returning back data specific error from a model
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
export default class Model<T> extends Error {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 * @param {String} message The message to pass in as the error message
	 * @param {Mixed} details Any data to capture
	 * @param {string} logging logging: 'all' | 'error' | 'warning' | 'info' | 'none' 
	 */
	constructor(message: string, details: object, logging?: 'all' | 'error' | 'warning' | 'info' | 'none')
}