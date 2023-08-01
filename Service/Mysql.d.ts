import mysql2 from 'mysql2/promise';

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
export default class Mysql {

	public mysql: mysql2;
	public name: string;
	public service: string;
	public host: string;
	public port: number;
	public db: string;
	public user: string;
	public password: string;

	protected con: any;

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor(host: string, port: number, db: string, user: string, password: string);

	connect(): Promise<void>;

	end(): Promise<void>;
}