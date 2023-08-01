import knex from 'knex';

/**
 * @module cerberus-mvc/Service/Knex
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
export default class Knex extends knex {

	public service: string;
	public connClient: object | string;
	public host: string;
	public port: number;
	public db: string;
	public user: string;
	public password: string;

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor(connClient: string | object, host: string, port: number, db: string, user: string, password: string);
}