/**
 * @module cerberus-mvc/Library/ObjectTools
 * @class ObjectTools
 * @description Set of tools for playing with objects
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
export default class ObjectTools {

	/**
	 * @public @static @name propertiesMatch
	 * @description Check properties match in two objects, to ensure they have the same properties in both
	 * @param {String} obj1 The first object
	 * @param {String} obj2 The second object
	 * @return {Boolean} True is both objects have the same properties
	 */
	static propertiesMatch(obj1: object, obj2: object): boolean;

	/**
	 * @public @static @name propertiesExist
	 * @description Check properties from obj1 exist in obj2, to ensure min requirement is met
	 * @param {String} obj1 The first object
	 * @param {String} obj2 The second object
	 * @return {Boolean} True is both objects have the same properties
	 */
	static propertiesExist(obj1: object, obj2: object): boolean;
}