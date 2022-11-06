'use strict';

/**
 * @namespace MVC/Error
 * @class System
 * @extends Error
 * @description System class to give extended error functionality as a rest error, for returning back to client
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class System extends Error {

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
		if (Error.captureStackTrace) Error.captureStackTrace(this, System);

		this.name = 'SystemError';
		this.exception = true;
		this.message = message;
		this.details = details || {};

		if (['all', 'error'].includes((process.__environment.CMVC_LOGGING || 'all').toLowerCase())) console.log(this);
	}
}

module.exports = System;