import Core from '../System/Core';
import Dynamo from '../Service/Dynamo';

/**
 * @module cerberus-mvc/Base/ModelDynamo
 * @class ModelDynamo
 * @extends Core
 * @description System class to give a base for creating dynamo models
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
export default abstract class ModelDynamo<T = object> extends Core<T> {

	public dbname: string;
	public params: object;

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor(dbname: ModelDynamo['dbname'], table: string, params: ModelDynamo['params'])

	/**
	 * @public @get dynamo
	 * @desciption Get the services available to the system
	 * @return {Knex} Knex service abstracted to dynamo
	 */
	get dynamo(): Dynamo['dynamo'];

	/**
	 * @public @get db
	 * @desciption Get the services available to the system
	 * @return {Knex} Knex service abstracted to db
	 */
	get db(): Dynamo['client'];

	/**
	 * @public @method create
	 * @description Create a new table resource
	 * @return {Promise} a resulting promise of data or error on failure
	 * @example
	 * let dynamoSource = new DynamoSourceModel();
	 * return dynamoSource.createTable();
	 */
	createTable(): Promise<any>;

	/**
	 * @public @method get
	 * @description Get a single resource in a single table by table id
	 * @param {Mixed} key The key to the resource as a literal string/number (mapping to one key schema) or an object as Keys matching key schema ({ id: 123456, something: 'else' })
	 * @return {Promise} a resulting promise of data or error on failure
	 * @example
	 * let dynamoSource = new DynamoSourceModel();
	 * return dynamoSource.get('6ff98823-3c0b-4b09-a433-63fc55cfa6d0');
	 */
	get<T>(key: string | number | T): Promise<T>;

	/**
	 * @public @method put
	 * @description Put a single resource into dynamo table
	 * @param {Object} item The data to put into the resource
	 * @return {Promise} a resulting promise of data or error on failure
	 * @example
	 * let dynamoSource = new DynamoSourceModel();
	 * return dynamoSource.put({
	 *		id: '6ff98823-3c0b-4b09-a433-63fc55cfa6d0',
	 *		product: [
	 * 			{
	 * 				title: 'Title Two',
	 * 				description: 'Description two... more stuff'
	 * 			}
	 * 		],
	 * 		filter: {
	 * 			z: 'zzz'
	 * 		}
	 * });
	 */
	put<T>(item: T): Promise<T>;

	/**
	 * @public @method update
	 * @description Update a single resource in dynamo table
	 * @param {Mixed} key The key to the resource as a literal string/number (mapping to one key schema) or an object as Keys matching key schema ({ id: 123456, something: 'else' })
	 * @param {Object} item The data to update in the resource { "some.path.to.property": "new value" }
	 * @return {Promise} a resulting promise of data or error on failure
	 * @example
	 * let dynamoSource = new DynamoSourceModel();
	 * return dynamoSource.update('9ff98823-3c0b-4b09-a433-63fc55cfa6d0', {
	 *		product: [
	 * 			{
	 * 				title: 'Title Two',
	 * 				description: 'Description two... more stuff'
	 * 			}
	 * 		]
	 * });
	 */
	update<T>(key: string | number | T, item: T): Promise<T>;

	/**
	 * @public @method listAppend
	 * @description Append item to a property list in dynamo table
	 * @param {Mixed} key The key to the resource as a literal string/number (mapping to one key schema) or an object as Keys matching key schema ({ id: 123456, something: 'else' })
	 * @param {Mixed} item The data to append in the resource { "some.path.to.property": "new value" }
	 * @return {Promise} a resulting promise of data or error on failure
	 * @example
	 * let dynamoSource = new DynamoSourceModel();
	 * return dynamoSource.listAppend('9ff98823-3c0b-4b09-a433-63fc55cfa6d0', {
	 *		product: [
	 * 			{
	 * 				title: 'Title Two',
	 * 				description: 'Description two... more stuff'
	 * 			}
	 * 		]
	 * });
	 */
	listAppend<T>(key: string | number | T, item: T): Promise<T>;
}
