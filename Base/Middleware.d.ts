import Core from '../System/Core';

/**
 * @modle cerberus-mvc/Base/Middleware
 * @class Middleware
 * @extends Core
 * @description System class to give a base for creating middleware, exposing services and base methods
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
export default abstract class Middleware<T> extends Core<T> {}
