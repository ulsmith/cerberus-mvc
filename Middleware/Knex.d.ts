import Middleware from '../Base/Middleware';
import Response from '../System/Response';

/**
 * @module cerberus-mvc/Middleware/Knex
 * @class Knex
 * @extends Middleware
 * @description Middleware class providing knex DB connection handling on incomming event and outgoing response
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 */
export default class Knex<T> extends Middleware<T> {

    /**
	 * @public @method end
	 * @description Invoke middleware for outgoing response
     * @param {Object} response The outgoing response to API Gateway
     * @param {Object} context The lambda context
     */
	end(response: Response): Promise<Response>;
}