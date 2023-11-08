'use strict';

const Request = require('./Request');
const Response = require('./Response');
const Path = require('path');

/**
 * @module cerberus-mvc/System/Application
 * @class Application
 * @description System application handler, talking back to lambda to bridge LAPI with AWS
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
class Application {
	constructor(type, mode, controllerDir, forceGlobals) {
		// do we want to isolate globals from process (express and socket need this!)
		this.globals = forceGlobals || ['express', 'socket'].includes(type) ? {} : process.__$globals = {};
		this.globals.$services = {};
		this.globals.$environment = {};
		this.globals.$handler = {};

		this.globals.$environment.random = Math.random();

		this._middleware = { start: [], mount: [], in: [], out: [], end: []};
		this._controller = {};
		this._types = ['aws', 'azure', 'express', 'socket'];
		if (this._types.indexOf(type) < 0) throw Error('Type does not exist, please add a type of request [' + this._types.join(', ') + ']');
		this._type = type;

		this._pwd = process.env.PWD || process.cwd() || '../';
		this._controllerDir = !controllerDir ? Path.join(this._pwd, 'src/Controller') : (['/', '\\'].includes(controllerDir.charAt(0)) ? controllerDir : Path.join(this._pwd, controllerDir));

		// get env vars
		if (this._type === 'aws' || this._type === 'azure') this.globals.$environment = Object.assign({}, process.env);
		else if (this._type === 'express' || this._type === 'socket') {
			try {
				const template = require('../../../template.json');
				if (template.global) {
					if (template.global.environment) this.globals.$environment = Object.assign({}, template.global.environment, process.env);
					if (template.global.handler) this.globals.$handler = { file: template.global.handler, mjs: template.global.handler.split('.').pop() === 'mjs', type: template.global.handler.split('.').pop() === 'mjs' ? 'es-module' : 'module'};
				} else this.globals.$environment = Object.assign({}, process.env);
			}
			catch (e) { throw Error('Cannot located template.json in project root') }
		}

		console.log( this.globals.$handler)

		// ensure any required system env vars are set and available system wide at route process (not affected by shared process as system wide)
		process.__CMVC_TYPE = this.globals.$environment.CMVC_TYPE = type;
		process.__CMVC_NAME = this.globals.$environment.CMVC_NAME = this.globals.$environment.CMVC_NAME || 'CerberusMVC';
		process.__CMVC_ADDRESS = this.globals.$environment.CMVC_ADDRESS = this.globals.$environment.CMVC_ADDRESS || 'localhost';
		process.__CMVC_VERSION = this.globals.$environment.CMVC_VERSION = this.globals.$environment.CMVC_VERSION || 'x.x.x';
		process.__CMVC_MODE = this.globals.$environment.CMVC_MODE = this.globals.$environment.CMVC_MODE || 'development';
		process.__CMVC_CORS_LIST = this.globals.$environment.CMVC_CORS_LIST = this.globals.$environment.CMVC_CORS_LIST || 'http://localhost,http://localhost:5173,http://localhost:4173';
		process.__CMVC_LOGGING = this.globals.$environment.CMVC_LOGGING = this.globals.$environment.CMVC_LOGGING || 'all';
		process.__CMVC_PATH_SHIFT = this.globals.$environment.CMVC_PATH_SHIFT = this.globals.$environment.CMVC_PATH_SHIFT;
		process.__CMVC_PATH_UNSHIFT = this.globals.$environment.CMVC_PATH_UNSHIFT = this.globals.$environment.CMVC_PATH_UNSHIFT;
		process.__CMVC_FORCE_GLOBALS = !!forceGlobals;

		// if mode passed in, set it directly
		if (mode === 'es-module') this.globals.$handler.type = 'es-module';
		if (mode === 'mjs-es-module') {
			this.globals.$handler.mjs = true;
			this.globals.$handler.type = 'es-module';
		}
		if (mode === 'module') this.globals.$handler.type = 'module';
	}

	service(s) {
		s = !Array.isArray(s) ? [s] : s;
		for (let i = 0; i < s.length; i++) if (s[i].service) this.globals.$services[s[i].service] = s[i];
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
		let requests = new Request(this._type, data, this.globals);
		requests = requests.requests || [requests];

		// run middleware before anything mounted or checked
		requests = await this._middleware.start.reduce((p, mw) => p.then((r) => mw.start(r)), Promise.resolve(requests));

		if (data.socket) this.globals.$socket = data.socket;
		if (data.io) this.globals.$io = data.io;

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
				this.globals.$client = { origin: req.headers.Origin || req.headers.origin };
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
				if (this.globals.$environment.CMVC_PATH_UNSHIFT || this.globals.$environment.PATH_UNSHIFT) rpath = rpath.replace(this.globals.$environment.CMVC_PATH_UNSHIFT || this.globals.$environment.PATH_UNSHIFT, '');
				if (this.globals.$environment.CMVC_PATH_SHIFT || this.globals.$environment.PATH_SHIFT) rpath = (this.globals.$environment.CMVC_PATH_SHIFT || this.globals.$environment.PATH_UNSHIFT) + rpath;

				// resolve name and path
				let resourcePath = rpath.split('/');
				for (let i = 0; i < resourcePath.length; i++) {
					if (!resourcePath[i]) continue;
					if (!resourcePath[i] || resourcePath[i].charAt(0) === '{') continue;
					name += resourcePath[i].replace(/\b[a-z]/g, (char) => { return char.toUpperCase() }).replace(/_|-|\s/g, '');
					path += resourcePath[i].replace(/\b[a-z]/g, (char) => { return char.toUpperCase() }).replace(/_|-|\s/g, '') + '/';
				}
				path = path.substring(0, path.length - 1) + (this.globals.$handler.mjs ? '.mjs' : '.js');

				try {
					this._controller[name] = (this.globals.$handler.type === 'es-module' ? Object.values(await import(this._controllerDir.replace(/(\/)+$/, '') + '/' + path))[0] : require(this._controllerDir.replace(/(\/)+$/, '') + '/' + path));
					req.access = this._controller[name][req.method] || {};
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
							body: `409 Resource missing for [${req.path}], cannot resolve controller automatically due to incorrect PWD on host, or incorrect controllerDir set`
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
				const controller = new this._controller[name](this.globals);
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
				return (new this._controller[name](this.globals))[req.method](req);
			})

			// handle response
			.then((out) => new Response(this._type, {
				isBase64Encoded: out && out.isBase64Encoded,
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
