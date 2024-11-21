/**
 * @module cerberus-mvc/System/Request
 * @class Request
 * @description System class to give a base for all system classes, such as services, models, controllers
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
export default class Request<T = { access: object, headers: object, body: any; }, G = { $environment: object, $client: object, $services: object[], $socket: object, $io: object }> {
	
	public type: 'aws' | 'azure' | 'express' | 'socket';
	public source: string;
	public context: object;
	public access: T['access'];
	public method: string;
	public path: string;
	public resource: object;
	public parameters: { path: object, query: object };
	public headers: T['headers'];
	public body: T['body'];
	public requests: Request[];

	constructor (type: Request['type'], data: object, globals: G);
}
