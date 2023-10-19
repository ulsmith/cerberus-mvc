'use strict';

const Core = require('cerberus-mvc/System/Core.js');
const ModelError = require('cerberus-mvc/Error/Model.js');

/**
 * @module cerberus-mvc/Base/ModelDynamo
 * @class ModelDynamo
 * @extends Core
 * @description System class to give a base for creating dynamo models
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
class ModelDynamo extends Core {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor(dbname, table, params, globals) {
		super(globals);
		
		if (!table) throw new ModelError('table is required in params for dynamo db connection');

		this.dbname = dbname;
		this.params = { ...{
			TableName: table,
			KeySchema: [
				{
					AttributeName: "id",
					KeyType: "HASH"
				}
			],
			AttributeDefinitions: [
				{
					AttributeName: "id",
					AttributeType: "S"
				}
			],
			ProvisionedThroughput: {
				ReadCapacityUnits: 10,
				WriteCapacityUnits: 10
			}
		}, ...(params || {})};
	}

	/**
	 * @public @get dynamo
	 * @desciption Get the services available to the system
	 * @return {Knex} Knex service abstracted to dynamo
	 */
	get dynamo() { return this.$services['dynamo:' + this.dbname].dynamo }

	/**
	 * @public @get db
	 * @desciption Get the services available to the system
	 * @return {Knex} Knex service abstracted to db
	 */
	get db() { return this.$services['dynamo:' + this.dbname].client }

	/**
	 * @public @method create
	 * @description Create a new table resource
	 * @return {Promise} a resulting promise of data or error on failure
	 * @example
	 * let dynamoSource = new DynamoSourceModel();
	 * return dynamoSource.createTable();
	 */
	createTable() {
		return new Promise((res, rej) => this.dynamo.createTable(this.params, (err, data) => err ? rej(err) : res(data)));
	}

	/**
	 * @public @method get
	 * @description Get a single resource in a single table by table id
	 * @param {Mixed} key The key to the resource as a literal string/number (mapping to one key schema) or an object as Keys matching key schema ({ id: 123456, something: 'else' })
	 * @return {Promise} a resulting promise of data or error on failure
	 * @example
	 * let dynamoSource = new DynamoSourceModel();
	 * return dynamoSource.get('6ff98823-3c0b-4b09-a433-63fc55cfa6d0');
	 */
	get(key) {
		return new Promise((res, rej) => this.db.get({
			TableName: this.params.TableName,
			Key: typeof key !== 'object' ? { [this.params.KeySchema[0].AttributeName]: key } : key
		}, (err, data) => err ? rej(err) : res(data)))
	}

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
	put(item) {
		return new Promise((res, rej) => this.db.put({
			TableName: this.params.TableName,
			Item: item,
			ReturnValues: "ALL_OLD"
		}, (err, data) => err ? rej(err) : res(item)));
	}

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
	update(key, item) {
		// map data to update
		let iKeys = Object.keys(item);
		let uExp = 'SET ' + iKeys.map((k, i) => `#${i} = :${i}`).join(', ');
		let eNames = iKeys.reduce((p, c, i) => ({ ...p, [`#${i}`]: c }), {});
		let eValues = iKeys.reduce((p, c, i) => ({ ...p, [`:${i}`]: item[c] }), {});

		return new Promise((res, rej) => this.db.update({
			TableName: this.params.TableName,
			Key: typeof key !== 'object' ? { [this.params.KeySchema[0].AttributeName]: key } : key,
			UpdateExpression: uExp,
			ExpressionAttributeNames: eNames,
			ExpressionAttributeValues: eValues,
			ReturnValues: "ALL_NEW"
		}, (err, data) => err ? rej(err) : res(data)));
	}

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
	listAppend(key, item) {
		// map data to update
		let iKeys = Object.keys(item);
		let uExp = 'SET ' + iKeys.map((k, i) => `#${i} = list_append(#${i}, :${i})`).join(', ');
		let eNames = iKeys.reduce((p, c, i) => ({ ...p, [`#${i}`]: c }), {});
		let eValues = iKeys.reduce((p, c, i) => ({ ...p, [`:${i}`]: item[c] }), {});

		return new Promise((res, rej) => this.db.update({
			TableName: this.params.TableName,
			Key: typeof key !== 'object' ? { [this.params.KeySchema[0].AttributeName]: key } : key,
			UpdateExpression: uExp,
			ExpressionAttributeNames: eNames,
			ExpressionAttributeValues: eValues,
			ReturnValues: "ALL_NEW"
		}, (err, data) => err ? rej(err) : res(data)));
	}
}

module.exports = ModelDynamo;
