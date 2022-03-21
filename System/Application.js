'use strict';

var Request = require('./Request');
var Response = require('./Response');

/**
 * @namespace MVC/System
 * @class Application
 * @description System application handler, talking back to lambda to bridge LAPI with AWS
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Application {
	constructor(type) {
		process.__services = {};
		process.__environment = {};
		process.__handler = {};
		this._middleware = { in: [], out: []};
		this._controller = {};
		this._types = ['aws', 'express', 'socket'];
		if (this._types.indexOf(type) < 0) throw Error('Type does not exist, please add a type of request [' + this._types.join(', ') + ']');
		this._type = type;

		// get env vars
		if (this._type === 'aws') process.__environment = Object.assign({}, process.env);
		else if (this._type === 'express' || this._type === 'socket') {
			try {
				const template = require('../../../template.json');
				if (template.global) {
					if (template.global.environment) process.__environment = Object.assign({}, process.env, template.global.environment);
					if (template.global.handler) process.__handler = { file: template.global.handler, type: template.global.handler.split('.').pop() === 'mjs' ? 'es-module' : 'module'};
				} 
			}
			catch (e) { throw Error('Cannot located template.json in project root') }
		}
	}

	service(s) {
		s = !Array.isArray(s) ? [s] : s;
		for (let i = 0; i < s.length; i++) if (s[i].service) process.__services[s[i].service] = s[i];
	}

	middleware(mw) {
		mw = !Array.isArray(mw) ? [mw] : mw; 
		for (let i = 0; i < mw.length; i++) {
			if (mw[i].in) this._middleware.in.push(mw[i]);
			if (mw[i].out) this._middleware.out.push(mw[i]);
		}
	}

	middlewareIn(mw) {
		mw = !Array.isArray(mw) ? [mw] : mw;
		for (let i = 0; i < mw.length; i++) if (mw[i].in) this._middleware.in.push(mw[i]);
	}

	middlewareOut(mw) {
		mw = !Array.isArray(mw) ? [mw] : mw;
		for (let i = 0; i < mw.length; i++) if (mw[i].out) this._middleware.out.push(mw[i]);
	}

	async run(data) {
		let promises = [];
		let requests = new Request(this._type, data);
		requests = requests.requests || [requests];

		if (data.socket) process.__socket = data.socket;
		if (data.io) process.__io = data.io;

		for (const request of requests) {
			if (!request.resource || !request.resource.path) {
				return Promise.resolve((new Response(this._type, {
					status: 404,
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': request && request.headers && request.headers.Origin ? request.headers.Origin : '*',
						'Access-Control-Allow-Credentials': 'true',
						'Access-Control-Allow-Headers': 'Accept, Cache-Control, Content-Type, Content-Length, Authorization, Pragma, Expires',
						'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
						'Access-Control-Expose-Headers': 'Cache-Control, Content-Type, Authorization, Pragma, Expires'
					},
					body: `404 Not Found [${request.path}]`
				})).get());
			}

			// parse resource to name and path 
			let path = '', name = '';
			let resourcePath = request.resource.path.split('/');
			for (let i = 1; i < resourcePath.length; i++) {
				if (!!resourcePath[i] && resourcePath[i].charAt(0) === '{') continue;
				name += resourcePath[i].replace(/\b[a-z]/g, (char) => { return char.toUpperCase() }).replace(/_|-|\s/g, '');
				path += resourcePath[i].replace(/\b[a-z]/g, (char) => { return char.toUpperCase() }).replace(/_|-|\s/g, '') + '/';
			}
			path = path.substring(0, path.length - 1) + (process.__handler.type === 'es-module' ? '.mjs' : '.js');

			// resolve controller
			try {
				this._controller[name] = (process.__handler.type === 'es-module' ? Object.values(await import('../../../src/Controller/' + path))[0] : require('../../../src/Controller/' + path));
				request.access = this._controller[name][request.method];
			} catch (error) {
				if (process.__environment.API_MODE === 'development') console.log(error.message, JSON.stringify(error.stack));
				
				if (error.message.toLowerCase().indexOf('cannot find module') >= 0) {
					return Promise.resolve((new Response(this._type, {
						status: 409,
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': request && request.headers && request.headers.Origin ? request.headers.Origin : '*',
							'Access-Control-Allow-Credentials': 'true',
							'Access-Control-Allow-Headers': 'Accept, Cache-Control, Content-Type, Content-Length, Authorization, Pragma, Expires',
							'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
							'Access-Control-Expose-Headers': 'Cache-Control, Content-Type, Authorization, Pragma, Expires'
						},
						body: `409 Resource missing for [${request.path}]`
					})).get());
				}
				
				return Promise.resolve((new Response(this._type, {
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': request && request.headers && request.headers.Origin ? request.headers.Origin : '*',
						'Access-Control-Allow-Credentials': 'true',
						'Access-Control-Allow-Headers': 'Accept, Cache-Control, Content-Type, Content-Length, Authorization, Pragma, Expires',
						'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
						'Access-Control-Expose-Headers': 'Cache-Control, Content-Type, Authorization, Pragma, Expires'
					},
					body: `500 Server Error [${request.path}]`
				})).get());
			}

			// process requests
			promises.push(this._process(new this._controller[name](), request));
		}

		return Promise.all(promises)
			.then((responses) => responses.length < 2 ? responses[0].get() : (new Response(this._type, { status: 200, headers: { 'Content-Type': 'application/json' }, body: { success: 'OK' }})).get())
			.catch(() => Promise.resolve((new Response(this._type, { status: 400, headers: { 'Content-Type': 'application/json' }, body: '400 Could not process all requests' })).get()))
	}

	_process(controller, request) {
		return Promise.resolve()
			// create client object
			.then(() => process.__client = { origin: request.headers.Origin })

			// incoming middleware, run synchronously as each one impacts on the next
			.then(() => this._middleware.in.reduce((p, mw) => p.then((r) => mw.in(r)), Promise.resolve(request)))

			// run controller and catch errors
			.then((req) => controller[req.method](req))
			.then((out) => new Response(this._type, {
				isBase64Encoded: out.isBase64Encoded,
				status: out && out.body && out.status ? out.status : 200,
				headers: { ...{ 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }, ...(out && out.body && out.headers ? out.headers : {}) },
				body: out && out.body && out.status ? out.body : (out ? out : null)
			}))
			.catch((error) => {
				// catch any other errors
				if (process.__environment.API_MODE === 'development') console.log(error.message, JSON.stringify(error.stack));

				// other errors like model, service etc (custom)
				return new Response(this._type, {
					status: error.name.toLowerCase() === 'error' ? 500 : error.status || 400,
					headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
					body: error.name.toLowerCase() === 'resterror' ? error.message : (error.name.toLowerCase() === 'error' ? 'system error' : error)
				});
			})
			
			// outgoing middleware, run synchronously as each one impacts on the next
			.then((response) => this._middleware.out.reduce((p, mw) => p.then((r) => mw.out(r)), Promise.resolve(response)))

			// finally catch any last issues in middleware and output back to lambda, important to ensure middleware can run in event of ocntroller error
			.catch((error) => {
				// catch any other errors
				if (process.__environment.API_MODE === 'development') console.log(error.message, JSON.stringify(error.stack));

				// other errors like model, service etc (custom)
				return new Response(this._type, {
					status: error.name.toLowerCase() === 'error' ? 500 : error.status || 400,
					headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
					body: error.name.toLowerCase() === 'resterror' ? error.message : (error.name.toLowerCase() === 'error' ? 'system error' : error)
				});
			});
	}
}

module.exports = Application;
