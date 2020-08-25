'use strict';

const Core = require('../System/Core.js');
const SystemError = require('../Error/System.js');
const DataTools = require('../Library/DataTools');

/**
 * @namespace MVC/Base
 * @class Model
 * @extends Core
 * @description System class to give a base for creating models, exposing the knex DB service and giving base methods
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
class Model extends Core {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor(dbname, table) {
		super();

		this.dbname = dbname;
		this.table = table;
	}

	/**
	 * @public @get db
	 * @desciption Get the services available to the system
	 * @return {Knex} Knex service abstracted to db
	 */
	get db() { return this.$services[this.dbname] }

	/**
	 * @private @get model
	 * @description Get the service locked to table set in this.table
	 * @return {Knex}, locked to table if set in child model
	 */
	get model() {
		if (!this.table) throw new Error(`Cannot call base model method without setting this.table property in ${this.constructor.name} model`);
		return this.db.table(this.table);
	}
	
    /**
	 * @public @method get
	 * @description Get a single resource in a single table by table id
     * @param {Number} id The resource id to get
     * @return {Promise} a resulting promise of data or error on failure
     */
	get(id) { return this.model.where({id: id}).limit(1).then((data) => data[0] || {}) }

    /**
     * @public @method find
	 * @description Find one or more resources from a where object in a single table
     * @param {Object} where The where object as key value, or knex style where object
     * @return {Promise} a resulting promise of data or error on failure
     */
	find(where) { return this.model.where(where) }

    /**
     * @public @method all
	 * @description all resources from a single table
     * @return {Promise} a resulting promise of data or error on failure
     */
	all() { return this.model.where(true) }

    /**
     * @public @method transaction
	 * @description Proxy out the transaction method from knex to class
     * @param {Method} func The function to pass on
     * @return {Promise} a resulting promise of data or error on failure
     */
	transaction(func) { return this.db.transaction(func) }
	
    /**
     * @public @method insert
	 * @description Insert single/many resource/s in a single table, clear any default data (id, created, updated)
     * @param {Object} data The object data to insert into the resource as {key: value}
	 * @param {Mixed} returning The array of returned columns or a string
     * @return {Promise} a resulting promise of data or error on failure
     */
	insert(data, returning) { return this.model.insert(this.__cleanIncommingData(data)).returning(returning || 'id') }

    /**
     * @public @method transactInsert
	 * @description Transaction Insert single/many resource/s in a single table, clear any default data (id, created, updated)
     * @param {Object} trx The transaction to bind to
     * @param {Object} data The object data to insert into the resource as {key: value}
	 * @param {Mixed} returning The array of returned columns or a string
     * @return {Promise} a resulting promise of data or error on failure
     */
	transactInsert(trx, data, returning) { return this.db.transacting(trx).table(this.table).insert(this.__cleanIncommingData(data)).returning(returning || 'id') }
	
    /**
	 * @public @method update
	 * @description Update a single resource in a single table by table id, clear any default data (id, created, updated)
	 * @param {Mixed} where The resource id to update or an object of where data
	 * @param {Object} data The object data to update on the resource as {key: value}
	 * @param {Mixed} returning The array of returned columns or a string
	 * @return {Promise} a resulting promise of data or error on failure
     */
	update(where, data, returning) { return this.model.where(typeof where === 'object' ? where : { id: where }).update(this.__cleanIncommingData(data)).returning(returning || 'id') }
	
	/**
	 * @public @method transactUpdate
	 * @description Transaction Insert single/many resource/s in a single table, clear any default data (id, created, updated)
	 * @param {Object} trx The transaction to bind to
	 * @param {Mixed} where The resource id to update or an object of where data
	 * @param {Object} data The object data to insert into the resource as {key: value}
	 * @param {Mixed} returning The array of returned columns or a string
	 * @return {Promise} a resulting promise of data or error on failure
	 */
	transactUpdate(trx, where, data, returning) { return this.db.transacting(trx).table(this.table).where(typeof where === 'object' ? where : { id: where }).update(this.__cleanIncommingData(data)).returning(returning || 'id') }

	/**
     * @public @method delete
	 * @description Delete a single resource in a single table by table id
     * @param {Number} id The resource id to delete
     * @return {Promise} a resulting promise of data or error on failure
     */
	delete(id) { return this.model.where({ id: id }).delete() }

    /**
     * @public @method softDelete
	 * @description Soft delete a single resource from a table that has a corresponding backup table, pushing the value to that table
     * @param {Number} id The resource id to soft delete
     * @return {Promise} a resulting promise of data or error on failure
     */
	softDelete(id) { 
		return this.model.where({ id: id })
			.then((data) => {
				if (!data[0]) throw new SystemError('Cannot soft delete record, record does not exist in original table');
				return data[0];
			})
			.then((data) => this.db.table('deleted.' + this.table.replace('.', '___')).insert(data))
			.then(() => this.delete(id));
	}

    /**
     * @public @method softRestore
	 * @description Soft restore a single resource in a single table that has been soft deleted
     * @param {Number} id The resource id to soft restore
     * @return {Promise} a resulting promise of data or error on failure
     */
	softRestore(id) {
		return this.db.table('deleted.' + this.table.replace('.', '___')).where({ id: id })
			.then((data) => {
				if (!data[0]) throw new SystemError('Cannot soft restore record, record does not exist deleted table');
				return data[0];
			})
			.then((data) => this.model.insert(data))
			.then(() => this.db.table('deleted.' + this.table.replace('.', '___')).where({ id: id }).delete(id));
	}

    /**
     * @public @method mapDataToColumn
	 * @description Map all incoming data, to columns to make sure we have a full dataset, or send partial flag true to map only partial dataset
     * @param {Object} data The data to check against the columns
     * @param {Boolean} partial The flag to force a partial map on only data available in dataset
     * @return {Object} a resulting promise of data or error on failure
     */
	mapDataToColumn(data, partial) {
		if (!this.columns) throw new Error('Cannot map data without setting columns getter in model [' + DataTools.snakeToCamel(this.table.split('.')[1]) + ']');
		
		// single entry
		let clean = {};
		for (const key in this.columns) {
			let dataKey = DataTools.snakeToCamel(key);
			if ((!data || data[dataKey] === undefined || data[dataKey] === null) && this.columns[key].required && !partial) throw new SystemError('Invalid data, required property [' + dataKey + '] missing from [' + DataTools.snakeToCamel(this.table.split('.')[1]) + ']', this.columns);
						
			if (data[dataKey] !== undefined && data[dataKey] !== null) {
				if (!DataTools.checkType(data[dataKey], this.columns[key].type)) throw new SystemError('Invalid data, property [' + dataKey + '] type incorrect for [' + DataTools.snakeToCamel(this.table.split('.')[1]) + ']', this.columns);
				clean[key] = data[dataKey];
			}
		}

		// empty
		if (partial && Object.keys(clean).length < 1) throw new SystemError('Invalid data, must have at least one property in [' + DataTools.snakeToCamel(this.table.split('.')[1]) + ']', this.columns);
		return Object.keys(clean).length > 0 ? clean : undefined;
	}

    /**
     * @public @method mapDataArrayToColumn
	 * @description Map all incoming data array of data, to columns to make sure we have a full dataset, or send partial flag true to map only partial dataset
     * @param {Array} data The data to check against the columns
     * @param {Boolean} partial The flag to force a partial map on only data available in dataset
     * @return {Array} a resulting promise of data or error on failure
     */
	mapDataArrayToColumn(data, partial) {
		if (partial && !data) return;
		if (!data || !data.length) throw new SystemError('Data must be an array of data objects for [' + DataTools.snakeToCamel(this.table.split('.')[1]) + ']');

		// array of data entries?
		let allClean = [];
		for (let i = 0; i < data.length; i++) allClean.push(this.mapDataToColumn(data[i], partial));
		return allClean;
	}

    /**
     * @public @method parseError
	 * @description Parse the error code from teh database to see if we can show it, else generic message
     * @param {Error} error The error object
     * @return {Object} with parsed error data in fo rthe end user
     */
	parseError(error) {
		if (!error) return { expected: this.columns };
		if (error.code == '22P02' && error.routine == 'string_to_uuid') return { error: 'invalid data', detail: 'uuid' };
		if (error.code == '23505') return { error: 'not unique', detail: error.detail.split(')=(')[0].split('(')[1] };

		return { error: 'unknown' };
	}

    /**
     * @public @method checkColumnsStrict
	 * @description Check columns against dataset, ensure required are present too
     * @param {Object} data The data to check against the columns
     * @return {Promise} a resulting promise of data or error on failure
     */
	checkColumnsStrict(data) {
		for (const key in data) if (this.columns[key] === undefined) return false;
		for (const key in this.columns) if (data[key] === undefined && this.columns[key].required) return false;
		return true
	}

    /**
     * @private @method __cleanIncommingData
	 * @description Clean any incomming data free of default values set by the DB directly
     * @param {Mixed} data The resource data to clean or array of data
     * @return {Mixed} The cleaned data object or array of objects
     */
	__cleanIncommingData(data) {
		if (!data) return;

		if (data.length > 0) {
			let dataArray = [];
			for (let i = 0; i < data.length; i++) dataArray.push(this.__cleanIncommingData(data[i]));
			return dataArray;
		}

		let cleaned = Object.assign({}, data);
		
		if (cleaned.id) delete cleaned.id;
		if (cleaned.created) delete cleaned.created;
		if (cleaned.updated) delete cleaned.updated;

		return cleaned;
	}
}

module.exports = Model;
