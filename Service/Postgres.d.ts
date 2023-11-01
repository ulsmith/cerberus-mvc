import { Client } from 'pg';

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
export default class Postgres extends Client {

	public name: string;
	public service: string;
	public host: string;
	public port: number;
	public db: string;

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor(host: string, port: string, db: string, user: string, password: string, ssl?: object, connTimeout?: number);
}