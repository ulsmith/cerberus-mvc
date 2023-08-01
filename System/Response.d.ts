/**
 * @module cerberus-mvc/System/Response
 * @class Response
 * @description System class to give a base for all system classes, such as services, models, controllers
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
export default class Response {
	
	public type: 'aws' | 'azure' | 'express' | 'socket';
	public status: number;
	public headers: object;
	public body: string;
	public isBase64Encoded: boolean;

	constructor (type: Response['type'], data: any);

	get(): any;

	set(data: any);
}