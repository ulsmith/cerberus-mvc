'use strict';

/**
 * @namespace MVC/Error
 * @class Model
 * @extends Error
 * @description Model class to give extended error functionality as a rest error, for returning back data specific error from a model
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Model extends Error {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 * @param {String} message The message to pass in as the error message
	 * @param {Mixed} details Any data to capture
	 */
	constructor(message, details) {
		// Pass remaining arguments (including vendor specific ones) to parent constructor
		super();

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) Error.captureStackTrace(this, Model);

		this.name = 'ModelError';
		this.exception = true;
		this.message = message;
		this.details = details || {};

		if (process.__socket && process.__environment.API_MODE !== 'production') console.log(this);
	}
}

module.exports = Model;