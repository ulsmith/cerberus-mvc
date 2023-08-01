import Core from 'cerberus-mvc/System/Core';
import Mysql from '../Service/Mysql';

/**
 * @module cerberus-mvc/Base/ModelMysql
 * @class ModelMysql
 * @extends Core
 * @description System class to give a base for creating models, exposing the knex DB service and giving base methods
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
export default abstract class ModelMysql<T = object> extends Core<T> {

	public dbname: string;
	public table: string;
	public softDelete: boolean | undefined;
	public idCol: string | undefined;
	public createdCol: string | undefined;
	public updatedCol: string | undefined;
	public deleteCol: string | undefined;
	
	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor(
		dbname: ModelMysql['dbname'],
		table: ModelMysql['table'],
		softDelete: ModelMysql['softDelete'],
		idCol: ModelMysql['idCol'],
		createdCol: ModelMysql['createdCol'],
		updatedCol: ModelMysql['updatedCol'],
		deleteCol: ModelMysql['deleteCol']
	);

	/**
	 * @public @get db
	 * @desciption Get the services available to the system
	 * @return {Knex} Knex service abstracted to db
	 */
	get db(): Mysql['con'];

	/**
	 * @public notSoftDeleted
	 * @desciption Get insertable for soft delete check
	 * @return {String} The query insertable for checking soft delete, if set
	 */
	notSoftDeleted(prefix: string): string;

	/**
	 * @public @method get
	 * @description Get a single resource in a single table by table id
	 * @param {Number} id The resource id to get
	 * @return {Promise} a resulting promise of data or error on failure
	 */
	get<T>(id: string | number): Promise<T>;

	/**
	 * @public @method find
	 * @description Find one or more resources from a where object in a single table
	 * @param {Object} where The where object as key value, or knex style where object
	 * @return {Promise} a resulting promise of data or error on failure
	 */
	find<T>(where: object): Promise<T[]>;

	/**
	 * @public @method first
	 * @description Find one or more resources from a where object in a single table
	 * @param {Object} where The where object as key value, or knex style where object
	 * @return {Promise} a resulting promise of data or error on failure
	 */
	first<T>(where: object): Promise<T>;

	/**
	 * @public @method last
	 * @description Find one or more resources from a where object in a single table
	 * @param {Object} where The where object as key value, or knex style where object
	 * @return {Promise} a resulting promise of data or error on failure
	 */
	last<T>(where: object): Promise<T>;

	/**
	 * @public @method all
	 * @description all resources from a single table
	 * @return {Promise} a resulting promise of data or error on failure
	 */
	all<T>(): Promise<T[]>;

	/**
	 * @public @method insert
	 * @description Insert single/many resource/s in a single table, clear any default data (id, created, updated)
	 * @param {Array[Object]|Object} data The object data to insert into the resource as {key: value}
	 * @param {Mixed} returning The array of returned columns or a string
	 * @return {Promise} a resulting promise of data or error on failure
	 */
	insert<T>(data: object, returning: string[] | undefined): Promise<T[]>;

	/**
	 * @public @method update
	 * @description Update a single resource in a single table by table id, clear any default data (id, created, updated)
	 * @param {Mixed} where The resource id to update or an object of where data
	 * @param {Object} data The object data to update on the resource as {key: value}
	 * @return {Promise} a resulting promise of data or error on failure
	 */
	update<T>(where: object | string | number, data: object): Promise<T[]>;

	/**
	 * @public @method delete
	 * @description Delete a single resource in a single table by table id
	 * @param {Number} id The resource id to delete
	 * @return {Promise} a resulting promise of data or error on failure
	 */
	delete(id: string | number, type: string | undefined): Promise<void>;

	/**
	 * @public @method restore
	 * @description Soft restore a single resource (undelete) in a single table that has been soft deleted
	 * @param {Number} id The resource id to soft restore
	 * @return {Promise} a resulting promise of data or error on failure
	 */
	restore(id: string | number): Promise<void>;

	/**
	 * @public @method queryWhere
	 * @description Builds an SQL query snippit to add on to a query, from an object including where property or simple key values matching table names
	 * @param {Object} args Arguments to work through
	 * @param {Array} values Values object pointer to fill with values as they are created for binding to be used in execution
	 * @param {String} chain The chain type to join on with or default to 'WHERE' for no chain
	 * @return {String} The SQL snippit to add to SQL query
	 * @example 
	 * SIMPLE QUERY (as AND)
	 *  { id: '12345', name: 'test' }
	 * 
	 * COMPLEX QUERY (nested and various types)
	 * 	{
	 *		"where": [
	 *			{ "key": "id", "condition": "EQUALS", "value": "00231a73a9981d63b0f11a789a46ccb1" },
	 *			{ "chain": "AND", "key": "id", "condition": "IN", "value": ["00231a73a9981d63b0f11a789a46ccb1"] },
	 *			{ "chain": "AND", "key": "id", "condition": "EQUALS", "value": "00231a73a9981d63b0f11a789a46ccb1" },
	 *			{
	 *				"chain": "OR",
	 *				"where": [
	 *					{ "key": "id", "condition": "IS", "value": null },
	 *					{ "chain": "OR", "key": "id", "condition": "NOT", "value": "abc123" },
	 *					{ "chain": "OR", "key": "id", "condition": "EQUALS", "value": "00231a73a9981d63b0f11a789a46ccb1" }
	 *				]
	 *			}
	 *		]
	 *	}
	 */
	queryWhere(args: object, values: any[], chain: string): string;
	
	/**
	 * @public @method queryOrder
	 * @description Builds a query snippit to add on to a query string adding ORDER BY from arguments passed in
	 * @param {Object} args Arguments to work through as the whole argument list containing the order/orderBy as a property
	 * @return {String} The snippit to add to query as SQL snippet
	 * @example 
	 * {
	 *    order/orderBy: [
	 *        { key: "reference", direction: "ASC" },
	 *        { key: "id", direction: "ASC" }
	 *    ]
	 * }
	 * 
	 */
	queryOrder(args: object): string;

	/**
	 * @public @method queryLimit
	 * @description Builds a query snippit to add on to a query string adding LIMIT from arguments passed in
	 * @param {Object} args Arguments to work through as a whole argument list containing the limit as a property 
	 * @return {String} The snippit to add to query as SQL snippet
	 * @example
	 *   {
	 *    	limit: 10
	 *   }
	 */
	queryLimit(args: object): string;

	/**
	 * @public @method queryOffset
	 * @description Builds a query snippit to add on to a query string adding OFFSET from arguments passed in
	 * @param {Object} args Arguments to work through as a whole argument list containing the offset as a property
	 * @return {String} The snippit to add to query as SQL snippet
	 * @example 
	 *   {
	 *    	offset: 10
	 *   }
	 */
	queryOffset(args: object): string;

	/**
	 * @public @method arrayWhere
	 * @description Builds an array filter to apply where style query to JSON arrays returned from a query, including where property or simple key values matching table names
	 * @param {Object} args Arguments to work through
	 * @param {Array} items Array of the items to filter with SQL where style filtering
	 * @return {Array} The filtered array of items
	 * @example 
	 * SIMPLE QUERY (as AND)
	 *  { id: '12345', name: 'test' }
	 * 
	 * COMPLEX QUERY (nested and various types)
	 * 	{
	 *		"where": [
	 *			{ "key": "id", "condition": "EQUALS", "value": "00231a73a9981d63b0f11a789a46ccb1" },
	 *			{ "chain": "AND", "key": "id", "condition": "IN", "value": ["00231a73a9981d63b0f11a789a46ccb1"] },
	 *			{ "chain": "AND", "key": "id", "condition": "EQUALS", "value": "00231a73a9981d63b0f11a789a46ccb1" },
	 *			{
	 *				"chain": "OR",
	 *				"where": [
	 *					{ "key": "id", "condition": "IS", "value": null },
	 *					{ "chain": "OR", "key": "id", "condition": "NOT", "value": "abc123" },
	 *					{ "chain": "OR", "key": "id", "condition": "EQUALS", "value": "00231a73a9981d63b0f11a789a46ccb1" }
	 *				]
	 *			}
	 *		]
	 *	}
	 */
	arrayWhere(args: object, items: any[]): any[];

	/**
	 * @public @method arrayOrder
	 * @description Builds a sorter snippit to sort an array of items in an SQL style 'order by' way
	 * @param {Object} args Arguments to work through as the whole argument list containing the order/orderBy as a property
	 * @param {Array} items Array of the items to filter with SQL where style filtering
	 * @return {Array} The filtered array of items
	 * @example 
	 * {
	 *    order/orderBy: [
	 *        { key: "reference", direction: "ASC" },
	 *        { key: "id", direction: "ASC" }
	 *    ]
	 * }
	 * 
	 */
	arrayOrder(args: object, items: any[]): any[];

	/**
	 * @public @method arrayLimit
	 * @description Builds a splicer to splice 'limit' amount of records from an array in an SQL style way
	 * @param {Object} args Arguments to work through as a whole argument list containing the limit as a property 
	 * @param {Array} items Array of the items to filter with SQL where style filtering
	 * @return {Array} The filtered array of items
	 * @example
	 *   {
	 *    	limit: 10
	 *   }
	 */
	arrayLimit(args: object, items: any[]): any[];

	/**
	 * @public @method arrayOffset
	 * @description Builds a splicer to splice array from 'offset' from an array in an SQL style way
	 * @param {Object} args Arguments to work through as a whole argument list containing the limit as a property 
	 * @param {Array} items Array of the items to filter with SQL where style filtering
	 * @example 
	 *   {
	 *    	offset: 10
	 *   }
	 */
	arrayOffset(args: object, items: any[]): any[];

	/**
	 * @public @method mapDataToColumn
	 * @description Map all incoming data, to columns to make sure we have a full dataset, or send partial flag true to map only partial dataset
	 * @param {Object} data The data to check against the columns
	 * @param {Boolean} partial The flag to force a partial map on only data available in dataset
	 * @return {Object} a resulting promise of data or error on failure
	 */
	mapDataToColumn<T>(data: object, partial: boolean): T;

	/**
	 * @public @method mapDataArrayToColumn
	 * @description Map all incoming data array of data, to columns to make sure we have a full dataset, or send partial flag true to map only partial dataset
	 * @param {Array} data The data to check against the columns
	 * @param {Boolean} partial The flag to force a partial map on only data available in dataset
	 * @return {Array} a resulting promise of data or error on failure
	 */
	mapDataArrayToColumn<T>(data: object[], partial: boolean): T[];

	/**
	 * @public @method parseError
	 * @description Parse the error code from teh database to see if we can show it, else generic message
	 * @param {Error} error The error object
	 * @return {Object} with parsed error data in fo rthe end user
	 */
	parseError(error: object): object;

	/**
	 * @public @method checkColumnsStrict
	 * @description Check columns against dataset, ensure required are present too
	 * @param {Object} data The data to check against the columns
	 * @return {Promise} a resulting promise of data or error on failure
	 */
	checkColumnsStrict(data: object): boolean;

	/**
	 * @public @method inject
	 * @description Prepares text to inject into SQL directly for column names and such removing bad chars, quoting non * refs. WARNING! only inject variables for column names etc, NOT data!
	 * @param {String} text The string to inject into SQL that needs cleaning
	 * @return {String} a cleaned string
	 */
	inject(text: string): string;
}