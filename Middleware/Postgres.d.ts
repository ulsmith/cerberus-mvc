import Middleware from '../Base/Middleware';
import Request from '../System/Request';
import Response from '../System/Response';

/**
 * @module cerberus-mvc/Middleware/Postgres
 * @class Postgres
 * @extends Middleware
 * @description Middleware class providing Postgres DB connection handling on incomming event and outgoing response
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
export default class Postgres<T> extends Middleware<T> {

	/**
	 * @public @method start
	 * @description Invoke middleware for incoming request
	 * @param {Object} request The incoming request to API Gateway
	 */
	start(request: Request): Promise<Request>;

    /**
	 * @public @method end
	 * @description Invoke middleware for outgoing response
     * @param {Object} response The outgoing response to API Gateway
     */
	end(response: Response): Promise<Response>;
}