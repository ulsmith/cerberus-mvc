'use strict';

const { Client } = require('pg');

/**
 * @module cerberus-mvc/Service/Postgres
 * @class Postgres
 * @extends Client (the pg base class from npm)
 * @description Service class providing database connection using knex.js
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 * @example
 * new Postgres('192.168.1.10', 5432, 'your_db', 'your_user', 'your_password');
 */
class Postgres extends Client {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor(host, port, database, user, password, ssl, connectionTimeoutMillis) {
		connectionTimeoutMillis = connectionTimeoutMillis || 20000;

		// create knex
		super({
			host,
			port,
			database,
			user,
			password,
			ssl,
			connectionTimeoutMillis
		});

		// cache
		this.name = 'postgres';
		this.service = 'postgres:' + database;
		this.host = host;
		this.port = port;
		this.db = database;
	}
}

module.exports = Postgres;