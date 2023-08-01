import Core from '../System/Core';
import Knex from '../Service/Knex';

/**
 * @module cerberus-mvc/Base/ModelKnex
 * @class ModelKnex
 * @extends Core
 * @description System class to give a base for creating models, exposing the knex DB service and giving base methods
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
export default abstract class ModelKnex<T = object> extends Core<T> {

	public dbname: string;
	public table: string;
	public createdCol: string;
	public softDeleteCol: string;

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor(dbname: ModelKnex['dbname'], table: ModelKnex['table'], createdCol: ModelKnex['createdCol'], softDeleteCol: ModelKnex['softDeleteCol']);

	/**
	 * @public @get db
	 * @desciption Get the services available to the system
	 * @return {Knex} Knex service abstracted to db
	 */
	get db(): Knex;

	/**
	 * @private @get model
	 * @description Get the service locked to table set in this.table
	 * @return {Knex}, locked to table if set in child model
	 */
	get model(): Promise<any>;
	
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
	find<T>(where: object): Promise<T>;

    /**
     * @public @method all
	 * @description all resources from a single table
     * @return {Promise} a resulting promise of data or error on failure
     */
	all<T>(): Promise<T>;

    /**
     * @public @method transaction
	 * @description Proxy out the transaction method from knex to class
     * @param {Method} func The function to pass on
     * @return {Promise} a resulting promise of data or error on failure
     */
	transaction(func: any): any;
	
    /**
     * @public @method insert
	 * @description Insert single/many resource/s in a single table, clear any default data (id, created, updated)
     * @param {Object} data The object data to insert into the resource as {key: value}
	 * @param {Mixed} returning The array of returned columns or a string
     * @return {Promise} a resulting promise of data or error on failure
     */
	insert<T, TT>(data: T, returning: string[] | undefined): Promise<TT | { id: string | number } >;

    /**
     * @public @method transactInsert
	 * @description Transaction Insert single/many resource/s in a single table, clear any default data (id, created, updated)
     * @param {Object} trx The transaction to bind to
     * @param {Object} data The object data to insert into the resource as {key: value}
	 * @param {Mixed} returning The array of returned columns or a string
     * @return {Promise} a resulting promise of data or error on failure
     */
	transactInsert<T, TT>(trx: any, data: T, returning: string[] | undefined): Promise<TT | { id: string | number}>;
	
    /**
	 * @public @method update
	 * @description Update a single resource in a single table by table id, clear any default data (id, created, updated)
	 * @param {Mixed} where The resource id to update or an object of where data
	 * @param {Object} data The object data to update on the resource as {key: value}
	 * @param {Mixed} returning The array of returned columns or a string
	 * @return {Promise} a resulting promise of data or error on failure
     */
	update<T, TT>(where: object | string | number, data: T, returning: string[] | undefined): Promise<TT | { id: string | number}>;
	
	/**
	 * @public @method transactUpdate
	 * @description Transaction Insert single/many resource/s in a single table, clear any default data (id, created, updated)
	 * @param {Object} trx The transaction to bind to
	 * @param {Mixed} where The resource id to update or an object of where data
	 * @param {Object} data The object data to insert into the resource as {key: value}
	 * @param {Mixed} returning The array of returned columns or a string
	 * @return {Promise} a resulting promise of data or error on failure
	 */
	transactUpdate<T, TT>(trx: any, where: object | string | number, data: T, returning: string[] | undefined): Promise<TT | { id: string | number}>;

	/**
     * @public @method delete
	 * @description Delete a single resource in a single table by table id
     * @param {Number} id The resource id to delete
     * @return {Promise} a resulting promise of data or error on failure
     */
	delete(id: string | number): Promise<void>;

	/**
	 * @public @method transactDelete
	 * @description Transaction Delete single/many resource/s in a single table
	 * @param {Object} trx The transaction to bind to
	 * @param {Mixed} id The resource id or array to update or an object of where data
	 * @return {Promise} a resulting promise of data or error on failure
	 */
	transactDelete(trx: any, id: string | number): Promise<void>;

    /**
     * @public @method softDelete
	 * @description Soft delete a single resource from a table that has a corresponding backup table, pushing the value to that table
     * @param {Number} id The resource id to soft delete
     * @return {Promise} a resulting promise of data or error on failure
     */
	softDelete(id: string | number): Promise<void>;

    /**
     * @public @method softRestore
	 * @description Soft restore a single resource in a single table that has been soft deleted
     * @param {Number} id The resource id to soft restore
     * @return {Promise} a resulting promise of data or error on failure
     */
	softRestore(id: string | number): Promise<void>;

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
}
