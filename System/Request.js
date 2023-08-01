'use strict';

var DataTools = require('../Library/DataTools');

/**
 * @module cerberus-mvc/System/Request
 * @class Request
 * @description System class to give a base for all system classes, such as services, models, controllers
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
class Request {
	constructor (type, data) {
		const types = ['aws', 'azure', 'express', 'socket'];
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
		// API Gateway, run and return
		if (data.httpMethod) {
			this.source = 'route';
			return this[`_${this.type}Route`](data);
		}

		// array of events, collect events and return
		if (data.Records || data.rmqMessagesByQueue) {
			// preset many
			this.requests = [];
			this.source = 'events';

			// events wrapped in records array
			if (data.Records) {
				for (const record of data.Records) this.requests.push(new Request(this.type, record));
				return;
			}

			// rabbit events with wrapped message array
			if (data.rmqMessagesByQueue) {
				// run through all queues
				for (const q in data.rmqMessagesByQueue) {
					// run through all messages
					for (let i = 0; i < data.rmqMessagesByQueue[q].length; i++) {
						// wrap messages in common event object
						this.requests.push(new Request(this.type, {
							...data.rmqMessagesByQueue[q][i],
							eventSource: data.eventSource,
							eventSourceARN: (data.eventSourceArn || data.eventSourceARN) + ':' + q.split('::')[0]
						}));					
					}
				}
				return;
			}

			return; // ensure we dont process further in event of typos or updates...
		}

		// new remap data for event processing
		switch (data.eventSource) {
			case 'aws:sqs':
				data.context = { id: data.messageId, service: data.eventSource, receiptHandle: data.receiptHandle };
			break;
			case 'aws:rmq':
				data.context = { ...data.basicProperties, redelivered: data.redelivered };
				data.body = Buffer.from(data.data, 'base64').toString('utf8');
			break;
		}

		// individual events, run and return
		this.source = 'event';
		this[`_${this.type}Event`](data);
	}

	/**
	 * @public @get _awsRoute
	 * @desciption Get the environment data available to the system
	 * @return {Object} Middleware available
	 */
	_awsRoute(data) {
		// normalize headers
		const headers = {};
		for (const key in data.headers) headers[DataTools.normalizeHeader(key)] = data.headers[key];

		// normalized request object
		this.context = { id: data.requestContext.requestId, ipAddress: data.requestContext.identity.sourceIp };
		this.method = data.httpMethod ? data.httpMethod.toLowerCase() : undefined;
		this.path = data.path

		let rpath = data.resource;
		if (process.__environment.CMVC_PATH_UNSHIFT || process.__environment.PATH_UNSHIFT) rpath = rpath.replace(process.__environment.CMVC_PATH_UNSHIFT || process.__environment.PATH_UNSHIFT, '');
		if (process.__environment.CMVC_PATH_SHIFT || process.__environment.PATH_SHIFT) rpath = (process.__environment.CMVC_PATH_SHIFT || process.__environment.PATH_UNSHIFT) + rpath;

		this.resource = { path: data.resource === '/{error+}' ? undefined : (rpath === '/' || rpath === '' ? '/index' : data.resource) };
		this.parameters = { query: data.queryStringParameters || {}, path: data.pathParameters || {}};
		this.headers = headers;
		this.body = this._parseBody(data.body, headers['Content-Type']);
	}

	/**
	 * @private _awsEvent
	 * @desciption This is a single AWS event of unknown type (SQS compatible, Event Bridge compatible), try to handle it
	 * SQS, RMQ, event bridge etc...
	 * Nameing of event/queue is [system] double seperator [location] double seperator [controller]
	 * eventSource [aws:XXX] eventSourceARN [arn:aws:XXX:us-east-2:123456789012:system-name--controller-name]
	 * eventSource [aws:XXX] eventSourceARN [arn:aws:XXX:us-east-2:123456789012:system.name..controller.name]
	 * eventSource [aws:XXX] eventSourceARN [arn:aws:XXX:us-east-2:123456789012:system_name__controller_name]
	 * eventSource [aws:XXX] eventSourceARN [arn:aws:XXX:us-east-2:123456789012:systemName/controllerName]
	 * For system specific events all pointing to [system-name] system [src/Controller/ControllerName.js] controller [awsXxx] method
	 * 
	 * eventSource [aws:XXX] eventSourceARN [arn:aws:XXX:us-east-2:123456789012:queue-name]
	 * eventSource [aws:XXX] eventSourceARN [arn:aws:XXX:us-east-2:123456789012:queue.name]
	 * eventSource [aws:XXX] eventSourceARN [arn:aws:XXX:us-east-2:123456789012:queue_name]
	 * eventSource [aws:XXX] eventSourceARN [arn:aws:XXX:us-east-2:123456789012:queueName]
	 * For generic events on service for any type of system subscribed, pointing to subscribed system [src/Controller/QueueName.js] controller [awsXxx] method
	 * 
	 * Use double seperaters or slash in event/queue names to specify a sub folders in MVC
	 * eventSource [aws:XXX] eventSourceARN [arn:aws:XXX:us-east-2:123456789012:queue-name--something-else]
	 * eventSource [aws:XXX] eventSourceARN [arn:aws:XXX:us-east-2:123456789012:queue.name..something.else]
	 * eventSource [aws:XXX] eventSourceARN [arn:aws:XXX:us-east-2:123456789012:queue_name__something_else]
	 * eventSource [aws:XXX] eventSourceARN [arn:aws:XXX:us-east-2:123456789012:queueName/somethingElse]
	 * All point to [src/Controller/QueueName/SomethinElse.js] controller [awsXxx] method
	 * 
	 * for event bridge send in Input: '{"method": "get", "path": "controllerName"}' which will turn up on the data property
	 */
	_awsEvent(data) {
		// convert aws:xxx to method name awsXxx
		const method = data.eventSource ? data.eventSource.toLowerCase().replace(/\:\w/g, (m) => m[1].toUpperCase()) : data.method; 
		
		// convert queue name to controller path as capital case
		const resource = (data.eventSourceArn || data.eventSourceARN || data.path)
			.split(':')
			.pop()
			.split(/--|__|\.\.|\/\/|\//)
			.map((p) => p.replace(/^\w/g, (m) => m[0].toUpperCase()).replace(/\-\w|\_\w|\.\w/g, (m) => m[1].toUpperCase()))
			.join('/'); 

		// normalized request object
		this.context = data.context;
		this.method = method;
		this.path = resource;
		this.resource = { path: '/' + resource };
		this.headers = { 'Content-Type': 'application/json' };
		this.body = this._parseBody(data.body || data, this.headers['Content-Type']);
	}

	/**
	 * @private _azureParse
	 * @desciption parse the azure request
	 */
	_azureParse(data) {
		if (!data.req || !data.req.method || !data.req.url) throw Error('Azure integration only currently supports requests from http triggers');

		this.source = 'route';
		this[`_${this.type}Route`](data);
	}

	/**
	 * @public @get _azureRoute
	 * @desciption Handle the azure route data
	 */
	_azureRoute(data) {
		// normalize headers
		const headers = {};
		for (const key in data.headers) headers[DataTools.normalizeHeader(key)] = data.headers[key];

		// normalized request object
		this.context = { id: data.invocationId, ipAddress: data.req.headers['x-forwarded-for'] };
		this.method = data.req.method ? data.req.method.toLowerCase() : undefined;
		this.path = (data.req.originalUrl || data.req.url).replace(/https?:\/\/[a-zA-Z0-9_-]+[0-9:]+/, '').split('?')[0];

		// resolve function file
		try {
			const fn = require(data.executionContext.functionDirectory + '/function.json');
			const bn = fn.bindings.find((b) => b.type.toLowerCase() === 'httptrigger' && b.direction.toLowerCase() === 'in');
			data.resource = bn.route;
		} catch(err) {
			throw Error('Cannot access azure function.json, please ensure you have a function.json file in a subfolder (as the function name) on root');
		}

		let rpath = data.resource;
		if (process.__environment.CMVC_PATH_UNSHIFT || process.__environment.PATH_UNSHIFT) rpath = rpath.replace(process.__environment.CMVC_PATH_UNSHIFT || process.__environment.PATH_UNSHIFT, '');
		if (process.__environment.CMVC_PATH_SHIFT || process.__environment.PATH_SHIFT) rpath = (process.__environment.CMVC_PATH_SHIFT || process.__environment.PATH_UNSHIFT) + rpath;

		this.resource = { path: data.resource === '{*error}' || data.resource === '/{*error}' ? undefined : (rpath === '/' || rpath === '' ? '/index' : data.resource) };
		this.parameters = { query: data.req.query || {}, path: data.req.params || {} };
		this.headers = data.req.headers;
		this.body = this._parseBody(data.req.rawBody, this.headers['content-type']);
	}

	/**
	 * @public @get environment
	 * @desciption Get the environment data available to the system
	 * @return {Object} Middleware available
	 */
	_expressParse(data) {
		this.source = 'route';
		this[`_${this.type}Route`](data);
	}

	/**
	 * @public @get environment
	 * @desciption Get the environment data available to the system
	 * @return {Object} Middleware available
	 */
	_expressRoute(data) {
		// template pull
		let template;
		try { template = require('../../../template.json') }
		catch (e) { throw Error('Cannot located template.json in project root') }
		
		// normalize headers
		const headers = {};
		for (const key in data.headers) headers[DataTools.normalizeHeader(key)] = data.headers[key];

		// normalized request object
		this.context = { ipAddress: data.clientIp };
		this.method = data.method ? data.method.toLowerCase() : undefined;
		this.path = data.url.split('?')[0];

		// this needs to be a regex match on the above path to routes
		const resource = template.resources.find((r) => ((Array.isArray(r.method) && r.method.includes(this.method.toLowerCase()) || r.method === 'any' || r.method === this.method.toLowerCase())) && (new RegExp('^' + r.path.replace(/{.+\+}/g, '.+').replace(/{[^}]+}/g, '[^\/]+') + '$')).test(this.path));
		let keys;
		let values;
		if (resource && resource.path) {
			Array.from(resource.path.matchAll(new RegExp('^' + resource.path.replace(/{.+\+}/g, '(.+)').replace(/{[^}]+}/g, '([^\/]+)') + '$', 'g')), (m) => keys = m.slice(1, m.length).map((p) => p.replace(/{|}|\+/g, '')));
			Array.from(this.path.matchAll(new RegExp('^' + resource.path.replace(/{.+\+}/g, '(.+)').replace(/{[^}]+}/g, '([^\/]+)') + '$', 'g')), (m) => values = m.slice(1, m.length));
		
			let rpath = resource.path;
			if (process.__environment.CMVC_PATH_UNSHIFT || process.__environment.PATH_UNSHIFT) rpath = rpath.replace(process.__environment.CMVC_PATH_UNSHIFT || process.__environment.PATH_UNSHIFT, '');
			if (process.__environment.CMVC_PATH_SHIFT || process.__environment.PATH_SHIFT) rpath = (process.__environment.CMVC_PATH_SHIFT || process.__environment.PATH_UNSHIFT) + rpath;

			this.resource = {
				name: resource.name,
				method: this.method.toLowerCase(),
				path: rpath === '/' || rpath === '' ? '/index' : resource.path
			};

			if (resource.environment) process.__environment = Object.assign({}, process.__environment, resource.environment);
		}

		// need to use a match to now pull any params out and stuff them in paramters under path
		this.parameters = { query: data.query || {}, path: this.resource && keys.length > 0 && values.length > 0 ? Object.assign(...keys.map((k, i) => ({ [k]: values[i] }))) : {} };
		this.headers = headers;
		this.body = data.body;
	}

	/**
	 * @public @get environment
	 * @desciption Get the environment data available to the system
	 * @return {Object} Middleware available
	 */
	_socketParse(data) {
		this.source = 'route';
		this[`_${this.type}Route`](data);
	}

	/**
	 * @public @get environment
	 * @desciption Get the environment data available to the system
	 * @return {Object} Middleware available
	 */
	_socketRoute(data) {
		// template pull
		let template;
		try { template = require('../../../template.json') }
		catch (e) { throw Error('Cannot located template.json in project root') }

		// normalize headers
		const headers = {};
		for (const key in data.socket.handshake.headers) headers[DataTools.normalizeHeader(key)] = data.socket.handshake.headers[key];

		// normalized request object
		this.context = { ipAddress: data.socket.handshake.address };
		this.method = 'socket';
		this.path = data.route.split('?')[0];

		// this needs to be a regex match on the above path to routes
		const resource = template.resources.find((r) => (r.method === 'any' || r.method.toLowerCase() === this.method) && (new RegExp('^' + r.path.replace(/{.+\+}/g, '.+').replace(/{[^}]+}/g, '[^\/]+') + '$')).test(this.path));
		let keys;
		let values;
		if (resource && resource.path) {
			Array.from(resource.path.matchAll(new RegExp('^' + resource.path.replace(/{.+\+}/g, '(.+)').replace(/{[^}]+}/g, '([^\/]+)') + '$', 'g')), (m) => keys = m.slice(1, m.length).map((p) => p.replace(/{|}|\+/g, '')));
			Array.from(this.path.matchAll(new RegExp('^' + resource.path.replace(/{.+\+}/g, '(.+)').replace(/{[^}]+}/g, '([^\/]+)') + '$', 'g')), (m) => values = m.slice(1, m.length));
			this.resource = {
				name: resource.name,
				method: resource.method.toLowerCase(),
				path: resource.path
			};

			if (resource.environment) process.__environment = Object.assign({}, process.__environment, resource.environment);
		}

		// need to use a match to now pull any params out and stuff them in paramters under path
		this.parameters = { path: this.resource && keys.length > 0 && values.length > 0 ? Object.assign(...keys.map((k, i) => ({ [k]: values[i] }))) : {} };
		this.headers = headers;
		this.body = this._parseBody(data.data, headers['Content-Type']);
	}

	_parseBody(body, type) {
		// convert body
		switch (type) {
			case 'application/json': try { return JSON.parse(body) } catch (e) { return body }
			default: return body;
		}
	}
}

module.exports = Request;
