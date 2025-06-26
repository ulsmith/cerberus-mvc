/**
 * @module cerberus-mvc/System/Response
 * @class Response
 * @description System class to give a base for all system classes, such as services, models, controllers
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
export default class Response<T extends { headers: { [key: string]: string }, body: any } = { headers: { [key: string]: string }, body: any }> {
	
	public type: 'aws' | 'azure' | 'express' | 'socket';
	public status: number;
	public headers: T['headers'];
	public body: T['body'];
	public isBase64Encoded: boolean;

	constructor (type: Response['type'], data: any);

	get(): any;

	set(data: any);
}