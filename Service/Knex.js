'use strict';

const knex = require('knex');

/**
 * @namespace API/Service
 * @class Knex
 * @extends knex (the knex base class from npm)
 * @description Service class providing database connection using knex.js
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 * @example
 * new Knex('postgres', '192.168.1.10', 5432, 'your_db', 'your_user', 'your_password');
 * or
 * new Knex({
 *		client: 'postgres',
 *		connection: {
 *			host: '192.168.1.10',
 *			port: 5432,
 *			database: 'your_db',
 *			user: 'your_user',
 *			password: 'your_password'
 *		}
 * })
 */
class Knex extends knex {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor(connClient, host, port, db, user, password) {
		// create knex
		super(typeof connClient === 'object' ? connClient : {
			client: connClient,
			connection: {
				host: host,
				port: port,
				database: db,
				user: user,
				password: password
			}
		});

		// cache
		this.service = db || connClient.connection.database;
		this.connClient = connClient;
		this.host = host;
		this.port = port;
		this.db = db;
		this.user = user;
		this.password = password;
	}
}

module.exports = Knex;