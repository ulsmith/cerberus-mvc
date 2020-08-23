'use strict';

var DataTools = require('../Library/DataTools');

/**
 * @namespace MVC/System
 * @class Request
 * @description System class to give a base for all system classes, such as services, models, controllers
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
class Request {
	constructor (type, data) {
		const types = ['aws'];
		if (types.indexOf(type) < 0) throw Error('Type does not exist, please add a type of request [' + types.join(', ') + ']');
		
		this.type = type;
		this.source;
		this.context;
		this.method;
		this.path;
		this.resource;
		this.parameters;
		this.headers;
		this.body;
		this.requests;

		this[`_${this.type}Parse`](data);
	}

	/**
	 * @public @get environment
	 * @desciption Get the environment data available to the system
	 * @return {Object} Middleware available
	 */
	_awsParse(data) {
		if (data.httpMethod) {
			// API Gateway
			this.source = 'route';
			this[`_${this.type}Route`](data);
		} else if (data.eventSource) {
			// Internal AWS Event (SQS)
			this.source = 'event';
			this[`_${this.type}Event`](data);
		} else if (data.Records) {
			// Internal AWS Events (SQS)
			this.requests = [];
			this.source = 'events';
			for (const record of data.Records) this.requests.push(new Request(this.type, record));
		}
	}

	/**
	 * @public @get environment
	 * @desciption Get the environment data available to the system
	 * @return {Object} Middleware available
	 */
	_awsRoute(data) {
		// normalize headers
		const headers = {};
		for (const key in data.headers) headers[DataTools.normalizeHeader(key)] = data.headers[key];

		// normalized request object
		this.context = { id: data.requestContext.requestId, ipAddress: data.requestContext.identity.sourceIp },
		this.method = data.httpMethod ? data.httpMethod.toLowerCase() : undefined;
		this.path = data.path;
		this.resource = data.resource === '/{error+}' ? undefined : data.resource;
		this.parameters = { query: data.queryStringParameters, path: data.pathParameters };
		this.headers = headers;
		this.body = this._parseBody(data.body, headers['Content-Type']);
	}

	/**
	 * @public @get environment
	 * @desciption Get the environment data available to the system
	 * @return {Object} Middleware available
	 * arn:aws:sqs:us-east-2:123456789012:cerberus_some-path_bounce
	 */
	_awsEvent(data) {
		const esa = data.eventSourceARN.toLowerCase().split(':' + (process.env.API_NAME || '').toLowerCase() + '_');
		const method = esa[1] ? esa[1].split('_')[0] : '';
		const resource = esa[1] ? esa[1].split('_')[1].split('-').join('/') : '';

		// "eventSourceARN": "arn:aws:sqs:us-east-2:123456789012:cerberus_post_email-autoblock",
		// normalized request object
		this.context = { id: data.messageId, service: data.eventSource, receiptHandle: data.receiptHandle },
		this.method = method;
		this.path = resource;
		this.resource = '/' + resource;
		this.headers = { 'Content-Type': 'application/json' };
		this.body = this._parseBody(data.body, this.headers['Content-Type']);
	}

	_parseBody(body, type) {
		// convert body
		switch (type) {
			case 'application/json': try { return JSON.parse(body) } catch (e) { return {} }
			default: return body;
		}
	}
}

module.exports = Request;