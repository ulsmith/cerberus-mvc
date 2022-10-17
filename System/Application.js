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
	constructor(type, mode) {
		process.__services = {};
		process.__environment = {};
		process.__handler = {};
		this._middleware = { start: [], mount: [], in: [], out: [], end: []};
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
					if (template.global.environment) process.__environment = Object.assign({}, template.global.environment, process.env);
					if (template.global.handler) process.__handler = { file: template.global.handler, type: template.global.handler.split('.').pop() === 'mjs' ? 'es-module' : 'module'};
				} 
			}
			catch (e) { throw Error('Cannot located template.json in project root') }
		}

		// if mode passed in, set it directly
		if (mode === 'es-module') process.__handler.type = 'es-module';
		if (mode === 'module') process.__handler.type = 'module';
	}

	service(s) {
		s = !Array.isArray(s) ? [s] : s;
		for (let i = 0; i < s.length; i++) if (s[i].service) process.__services[s[i].service] = s[i];
	}

	middleware(mw) {
		mw = !Array.isArray(mw) ? [mw] : mw; 
		for (let i = 0; i < mw.length; i++) {
			if (mw[i].start) this._middleware.start.push(mw[i]);
			if (mw[i].mount) this._middleware.mount.push(mw[i]);
			if (mw[i].in) this._middleware.in.push(mw[i]);
			if (mw[i].out) this._middleware.out.push(mw[i]);
			if (mw[i].end) this._middleware.end.push(mw[i]);
		}
	}

	middlewareInit(mw) {
		mw = !Array.isArray(mw) ? [mw] : mw;
		for (let i = 0; i < mw.length; i++) if (mw[i].start) this._middleware.start.push(mw[i]);
	}

	middlewareMount(mw) {
		mw = !Array.isArray(mw) ? [mw] : mw;
		for (let i = 0; i < mw.length; i++) if (mw[i].mount) this._middleware.mount.push(mw[i]);
	}

	middlewareIn(mw) {
		mw = !Array.isArray(mw) ? [mw] : mw;
		for (let i = 0; i < mw.length; i++) if (mw[i].in) this._middleware.in.push(mw[i]);
	}

	middlewareOut(mw) {
		mw = !Array.isArray(mw) ? [mw] : mw;
		for (let i = 0; i < mw.length; i++) if (mw[i].out) this._middleware.out.push(mw[i]);
	}

	middlewareEnd(mw) {
		mw = !Array.isArray(mw) ? [mw] : mw;
		for (let i = 0; i < mw.length; i++) if (mw[i].end) this._middleware.end.push(mw[i]);
	}

	async run(data) {
		let promises = [];
		let requests = new Request(this._type, data);
		requests = requests.requests || [requests];

		// run middleware before anything mounted or checked
		requests = await this._middleware.start.reduce((p, mw) => p.then((r) => mw.start(r)), Promise.resolve(requests));

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
				})).get()).then((res) => this._middleware.end.reduce((p, mw) => p.then((r) => mw.end(r)), Promise.resolve()).then(() => res)); // make sure we end any started middleware on failure
			}

			// process requests
			promises.push(this._process(request));
		}

		return Promise.all(promises)
			.then((responses) => responses.length < 2 ? responses[0].get() : (new Response(this._type, { status: 200, headers: { 'Content-Type': 'application/json' }, body: responses.map((r) => r.get().body) })).get())
			.catch(() => Promise.resolve((new Response(this._type, { status: 400, headers: { 'Content-Type': 'application/json' }, body: { message: '400 Could not process all requests', detail: responses.map((r) => r.get().body) } })).get()))
			.then((responses) => this._middleware.end.reduce((p, mw) => p.then((r) => mw.end(r)), Promise.resolve(responses)));
	}

	_process(request) {
		return Promise.resolve(request)
			// create client object
			.then((req) => {
				process.__client = { origin: req.headers.Origin };
				return req;
			})

			// mount middleware, before controller is resolved for each request, run synchronously as each one impacts on the next
			.then((req) => this._middleware.mount.reduce((p, mw) => p.then((r) => mw.mount(r)), Promise.resolve(req)))

			// run controller and catch errors
			.then(async (req) => {
				// parse resource to name and path 
				let path = '', name = '';
				
				// adjust path prefix
				let rpath = req.resource.path;
				if (process.__environment.CMVC_PATH_UNSHIFT || process.__environment.PATH_UNSHIFT) rpath = rpath.replace(process.__environment.CMVC_PATH_UNSHIFT || process.__environment.PATH_UNSHIFT, '');
				if (process.__environment.CMVC_PATH_SHIFT || process.__environment.PATH_SHIFT) rpath = (process.__environment.CMVC_PATH_SHIFT || process.__environment.PATH_UNSHIFT) + rpath;

				// resolve name and path
				let resourcePath = rpath.split('/');
				for (let i = 1; i < resourcePath.length; i++) {
					if (!!resourcePath[i] && resourcePath[i].charAt(0) === '{') continue;
					name += resourcePath[i].replace(/\b[a-z]/g, (char) => { return char.toUpperCase() }).replace(/_|-|\s/g, '');
					path += resourcePath[i].replace(/\b[a-z]/g, (char) => { return char.toUpperCase() }).replace(/_|-|\s/g, '') + '/';
				}
				path = path.substring(0, path.length - 1) + (process.__handler.type === 'es-module' ? '.mjs' : '.js');

				// resolve controller
				try {
					this._controller[name] = (process.__handler.type === 'es-module' ? Object.values(await import('../../../src/Controller/' + path))[0] : require('../../../src/Controller/' + path));
					req.access = this._controller[name][req.method];
				} catch (error) {
					// catch any other errors, log errors to console
					if (!error.exception) console.warn(error.message, JSON.stringify(error.stack));

					if (error.message.toLowerCase().indexOf('cannot find module') >= 0) {
						return Promise.resolve((new Response(this._type, {
							status: 409,
							headers: {
								'Content-Type': 'application/json',
								'Access-Control-Allow-Origin': req && req.headers && req.headers.Origin ? req.headers.Origin : '*',
								'Access-Control-Allow-Credentials': 'true',
								'Access-Control-Allow-Headers': 'Accept, Cache-Control, Content-Type, Content-Length, Authorization, Pragma, Expires',
								'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
								'Access-Control-Expose-Headers': 'Cache-Control, Content-Type, Authorization, Pragma, Expires'
							},
							body: `409 Resource missing for [${req.path}]`
						})).get());
					}

					return Promise.resolve((new Response(this._type, {
						status: 500,
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': req && req.headers && req.headers.Origin ? req.headers.Origin : '*',
							'Access-Control-Allow-Credentials': 'true',
							'Access-Control-Allow-Headers': 'Accept, Cache-Control, Content-Type, Content-Length, Authorization, Pragma, Expires',
							'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
							'Access-Control-Expose-Headers': 'Cache-Control, Content-Type, Authorization, Pragma, Expires'
						},
						body: `500 Server Error [${req.path}]`
					})).get());
				}

				// instantiate and check
				const controller = new this._controller[name]();
				if (!controller[req.method]) {
					return Promise.resolve((new Response(this._type, {
						status: 405,
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': req && req.headers && req.headers.Origin ? req.headers.Origin : '*',
							'Access-Control-Allow-Credentials': 'true',
							'Access-Control-Allow-Headers': 'Accept, Cache-Control, Content-Type, Content-Length, Authorization, Pragma, Expires',
							'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
							'Access-Control-Expose-Headers': 'Cache-Control, Content-Type, Authorization, Pragma, Expires'
						},
						body: `405 Method not allowed [${req.method}] for [${req.path}]`
					})).get());
				}

				// run middleware after mount of controller but before running it
				req = await this._middleware.in.reduce((p, mw) => p.then((r) => mw.in(r)), Promise.resolve(req));

				// run controller
				return (new this._controller[name]())[req.method](req);
			})

			// handle response
			.then((out) => new Response(this._type, {
				isBase64Encoded: out.isBase64Encoded,
				status: out && out.body && out.status ? out.status : 200,
				headers: { ...{ 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }, ...(out && out.body && out.headers ? out.headers : {}) },
				body: out && out.body && out.status ? out.body : (out ? out : null)
			}))
			.catch((error) => {
				// catch any other errors, log errors to console
				if (!error.exception) console.warn(error.message, JSON.stringify(error.stack));

				// other errors like model, service etc (custom)
				return new Response(this._type, {
					status: ['error', 'typeerror'].includes(error.name.toLowerCase()) ? 500 : error.status || 400,
					headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
					body: error.name.toLowerCase() === 'resterror' ? error.message : (['error', 'typeerror'].includes(error.name.toLowerCase()) ? 'internal error' : error)
				});
			})
			
			// outgoing middleware, run synchronously as each one impacts on the next
			.then((response) => this._middleware.out.reduce((p, mw) => p.then((r) => mw.out(r)), Promise.resolve(response)))

			// finally catch any last issues in middleware and output back to lambda, important to ensure middleware can run in event of ocntroller error
			.catch((error) => {
				// catch any other errors, log errors to console
				if (!error.exception) console.warn(error.message, JSON.stringify(error.stack));

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
