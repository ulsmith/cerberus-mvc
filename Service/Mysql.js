'use strict';

const mysql2 = require("mysql2/promise");

/**
 * @module cerberus-mvc/Service/Mysql
 * @class Mysql
 * @description Service class providing database connection using knex.js
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 * @example
 * new Mysql('192.168.1.10', 5432, 'your_db', 'your_user', 'your_password');
 */
class Mysql {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor(host, port, db, user, password) {
		// create knex
		this.mysql = mysql2;

		// cache
		this.name = 'mysql';
		this.service = 'mysql:' + db;
		this.host = host;
		this.port = port;
		this.db = db;
		this.user = user;
		this.password = password;
	}

	connect() {
		return this.mysql.createConnection({
			connectionLimit: 10,
			host: this.host,
			port: this.port,
			user: this.user,
			password: this.password,
			database: this.db
		}).then((con) => {
			this.con = con; 
			delete this.user;
			delete this.password;
		});
	}

	end() {
		return this.con.end();
	}
}

module.exports = Mysql;