'use strict';

var DataTools = require('../Library/DataTools');

/**
 * @namespace MVC/System
 * @class Response
 * @description System class to give a base for all system classes, such as services, models, controllers
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
class Response {
	constructor (type, data) {
		const types = ['aws'];
		if (types.indexOf(type) < 0) throw Error('Type does not exist, please add a type of request [' + types.join(', ') + ']');
		this.type = type;
		this.status;
		this.headers;
		this.body;
		this.set(data);
	}

	get() {
		return this[`_${this.type}Convert`]();
	}

	set(data) {
		const headers = {};
		if (data.headers) {
			for (const key in data.headers) headers[DataTools.normalizeHeader(key)] = data.headers[key];
			this.headers = headers;
		}

		if (data.status) this.status = data.status;
		if (data.body !== undefined) this.body = this._parseBody(data.body, headers['Content-Type']);
	}

	_parseBody(body, type) {
		// convert body
		switch (type) {
			case 'application/json': try { return JSON.stringify(body) } catch (e) { return JSON.stringify(null) }
			default: return body;
		}
	}

	/**
	 * @public @get environment
	 * @desciption Get the environment data available to the system
	 * @return {Object} Middleware available
	 */
	_awsConvert() {
		// return nromalized request object
		return {
			statusCode: this.status,
			headers: this.headers,
			body: this.body
		}
	}
}

module.exports = Response;