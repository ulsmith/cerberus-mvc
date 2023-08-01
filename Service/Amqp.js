'use strict';

const amqp = require('amqplib');

/**
 * @module cerberus-mvc/Service/Amqp
 * @class Amqp
 * @description Service class providing AMQP connection using amqplib.js
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 * @example
 * new Amqp('amqp(s)://<username>:<password>@abc.xyx:5671');
 */
class Amqp {
	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor(alias, host, port, user, password) {
		// create knex
		this.amqp = amqp;

		// cache
		this.name = 'amqp';
		this.service = 'amqp:' + alias;
		this.alias = alias;
		this.host = host;
		this.port = port;
		this.user = user;
		this.password = password;
	}

	async connect() {
		const p = this.host.split('://');
		if (p.length != 2) throw new Error('Invalid AMQP connection string');

		this.connection = await this.amqp.connect(`${p[0]}://${this.user}:${this.password}@${p[1]}:${this.port}`);
		delete this.user;
		delete this.password;
	}

	end() {
		// need to bust the stack, next tick no worky
		return new Promise((res) => setTimeout(() => {
			this.connection.close();
			res();
		}, 1));
	}
}

module.exports = Amqp;