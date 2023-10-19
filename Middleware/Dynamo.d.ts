import Middleware from '../Base/Middleware';
import Request from '../System/Request';

/**
 * @module cerberus-mvc/Middleware/Dynamo
 * @class Dynamo
 * @extends Middleware
 * @description Middleware class providing Dynamo DB connection handling on incomming event and outgoing response
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
export default class Dynamo<T> extends Middleware<T> {

	/**
	 * @public @method start
	 * @description Invoke middleware for incoming request
	 * @param {Object} request The incoming request to API Gateway
	 */
	start(request: Request): Promise<Request>;
}