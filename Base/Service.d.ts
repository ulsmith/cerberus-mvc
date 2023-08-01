import Core from '../System/Core';

/**
 * @module cerberus-mvc/Base/Service
 * @class Service
 * @extends Core
 * @description System class to give a base for creating services
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
export default abstract class Service<T = object> extends Core<T> {}
