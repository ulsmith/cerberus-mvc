import Core from '../System/Core';
import { Client } from 'pg';

/**
 * @module cerberus-mvc/Base/ModelPG
 * @class ModelPG
 * @extends Core
 * @description System class to give a base for creating models, exposing the knex DB service and giving base methods
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
export default abstract class ModelPG<T> extends Core<T> {

	public dbname: string;
	public table: string;
	public softDelete: boolean;
	public idCol: string;
	public createdCol: string;
	public updatedCol: string;
	public deleteCol: string;

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor(
		globals: T,
		dbname: ModelPG['dbname'],
		table: ModelPG['table'],
		params?: {
			softDelete?: ModelPG['softDelete'],
			idCol?: ModelPG['idCol'],
			createdCol?: ModelPG['createdCol'],
			updatedCol?: ModelPG['updatedCol'],
			deleteCol?: ModelPG['deleteCol']
		}
	);

	/**
	 * @public @get db
	 * @desciption Get the services available to the system
	 * @return {Knex} Knex service abstracted to db
	 */
	get db(): Client;

	/**
	 * @public notSoftDeleted
	 * @desciption Get insertable for soft delete check
	 * @return {String} The query insertable for checking soft delete, if set
	 */
	notSoftDeleted(prefix: string): string;
	
    /**
	 * @public @method get
	 * @description Get a single resource in a single table by table id
     * @param id The resource id to get
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
	insert<T>(data: object | object[], returning: string[] | undefined): Promise<T[]>;

    /**
	 * @public @method update
	 * @description Update a single resource in a single table by table id, clear any default data (id, created, updated)
	 * @param {Mixed} where The resource id to update or an object of where data
	 * @param {Object} data The object data to update on the resource as {key: value}
	 * @param {Mixed} returning The array of returned columns or a string
	 * @return {Promise} a resulting promise of data or error on failure
     */
	update<T>(where: object, data: object | object[], returning: string[] | undefined): Promise<T[]>;
	
	/**
     * @public @method delete
	 * @description Delete a single resource in a single table by table id
     * @param id The resource id to delete
     * @return {Promise} a resulting promise of data or error on failure
     */
	delete(id: string | number, type: string | undefined): Promise<void>;

    /**
     * @public @method restore
	 * @description Soft restore a single resource (undelete) in a single table that has been soft deleted
     * @param id The resource id to soft restore
     * @return {Promise} a resulting promise of data or error on failure
     */
	restore(id: string | number): Promise<void>;

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
	mapDataArrayToColumn<T>(data: object, partial: boolean): T[];

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