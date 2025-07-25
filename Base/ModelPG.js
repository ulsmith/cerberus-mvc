'use strict';

const Core = require('../System/Core.js');
const ModelError = require('../Error/Model.js');
const DataTools = require('../Library/DataTools');

/**
 * @module cerberus-mvc/Base/ModelPG
 * @class ModelPG
 * @extends Core
 * @description System class to give a base for creating models, exposing the knex DB service and giving base methods
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
class ModelPG extends Core {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor(globals, dbname, table, params) {
		super(globals);

		this.dbname = dbname;
		this.table = table;
		this.softDelete = params?.softDelete;
		this.idCol = params?.idCol || 'id';
		this.createdCol = params?.createdCol || 'created';
		this.updatedCol = params?.updatedCol || 'updated';
		this.deleteCol = params?.deleteCol || 'deleted';
	}

	/**
	 * @public @get db
	 * @desciption Get the services available to the system via the database
	 * @return {Client} The PG Client via node-pg
	 */
	get db() { return this.$services['postgres:' + this.dbname] }

	/**
	 * @public notSoftDeleted
	 * @desciption Get insertable for soft delete check
	 * @return {String} The query insertable for checking soft delete, if set
	 */
	notSoftDeleted(prefix) { return this.softDelete ? `${prefix} ${this.inject(this.deleteCol)} IS NULL` : '' }
	
    /**
	 * @public @method get
	 * @description Get a single resource in a single table by table id
     * @param {Number} id The resource id to get
     * @return {Promise} a resulting promise of data or error on failure
     */
	get(id) { return this.db.query(`SELECT * FROM ${this.inject(this.table)} WHERE ${this.inject(this.idCol)} = $1 ${this.notSoftDeleted('AND')} LIMIT 1;`, [id]).then((res) => res.rows[0] || {}) }

    /**
     * @public @method find
	 * @description Find one or more resources from a where object in a single table
     * @param {Object} where The where object as key value, or knex style where object
     * @return {Promise} a resulting promise of data or error on failure
     */
	find(where) { 
		let q = Object.keys(where).map((w, i) => ` ${this.inject(w)} = $${i + 1} `).join(' AND ');
		let v = Object.values(where);

		return this.db.query(`SELECT * FROM ${this.inject(this.table)} WHERE ${q} ${this.notSoftDeleted('AND')};`, v).then((res) => res.rows);
	}

	/**
	 * @public @method first
	 * @description Find one or more resources from a where object in a single table
	 * @param {Object} where The where object as key value, or knex style where object
	 * @return {Promise} a resulting promise of data or error on failure
	 */
	first(where) {
		if (!this.createdCol) throw new ModelError('Must set created column in super request to use this feature.');
		if (!where || Object.keys(where).length < 1) return this.db.query(`SELECT * FROM ${this.inject(this.table)} ${this.notSoftDeleted('WHERE')} ORDER BY ${this.inject(this.createdCol)} ASC LIMIT 1;`).then((res) => res.rows[0] || {}); 

		let q = Object.keys(where).map((w, i) => ` ${this.inject(w)} = $${i + 1} `).join(' AND ');
		let v = Object.values(where);

		return this.db.query(`SELECT * FROM ${this.inject(this.table)} WHERE ${q} ${this.notSoftDeleted('AND')} ORDER BY ${this.inject(this.createdCol)} ASC LIMIT 1;`, v).then((res) => res.rows[0] || {});
	}

	/**
	 * @public @method last
	 * @description Find one or more resources from a where object in a single table
	 * @param {Object} where The where object as key value, or knex style where object
	 * @return {Promise} a resulting promise of data or error on failure
	 */
	last(where) {
		if (!this.createdCol) throw new ModelError('Must set created column in super request to use this feature.');
		if (!where || Object.keys(where).length < 1) return this.db.query(`SELECT * FROM ${this.inject(this.table)} ${this.notSoftDeleted('WHERE')} ORDER BY ${this.inject(this.createdCol)} DESC LIMIT 1;`).then((res) => res.rows[0] || {}); 

		let q = Object.keys(where).map((w, i) => ` ${this.inject(w)} = $${i + 1} `).join(' AND ');
		let v = Object.values(where);

		return this.db.query(`SELECT * FROM ${this.inject(this.table)} WHERE ${q} ${this.notSoftDeleted('AND')} ORDER BY ${this.inject(this.createdCol)} DESC LIMIT 1;`, v).then((res) => res.rows[0] || {});
	}

    /**
     * @public @method all
	 * @description all resources from a single table
     * @return {Promise} a resulting promise of data or error on failure
     */
	all() { return this.db.query(`SELECT * FROM ${this.inject(this.table)} ${this.notSoftDeleted('WHERE')};`) }
	
    /**
     * @public @method insert
	 * @description Insert single/many resource/s in a single table, clear any default data (id, created, updated)
     * @param {Array[Object]|Object} data The object data to insert into the resource as {key: value}
	 * @param {Mixed} returning The array of returned columns or a string
     * @return {Promise} a resulting promise of data or error on failure
     */
	insert(data, returning) { 
		data = this.__cleanIncommingData(data, true);
		if (typeof data === 'object' && data.length === undefined) data = [data];

		let qk = Object.keys(data[0]).map((k) => `${this.inject(k)}`).join(',');
		let cc = 0;
		let qv = data.map((d, i) => '(' + Object.values(d).map((dd, ii) => {
			cc++;
			if (dd && !isNaN(dd.x) && !isNaN(dd.y)) {
				cc++;
				return `POINT($${cc-1}, $${cc})`;
			}
			return `$${cc}`;
		}).join(',') + ')').join(',');
		let v = data.flatMap((d) => Object.values(d).flatMap((d) => d && !isNaN(d.x) && !isNaN(d.y) ? [d.x, d.y] : d));
		let r = typeof returning === 'string' ? `RETURNING ${this.inject(returning)}` : (Array.isArray(returning) ? 'RETURNING ' + returning.map((ret) => this.inject(ret)).join(',') : '');

		return this.db.query(`INSERT INTO ${this.inject(this.table)} (${qk}) VALUES ${qv} ${r};`, v)
			.then((res) => res.rows || [])
			.catch((error) => {
				if (error.code == 23505) throw new ModelError('Cannot duplicate a unique value, value already exists', this.columns);
				throw error;
			});
	}

    /**
	 * @public @method update
	 * @description Update a single resource in a single table by table id, clear any default data (id, created, updated)
	 * @param {Mixed} where The resource id to update or an object of where data
	 * @param {Object} data The object data to update on the resource as {key: value}
	 * @param {Mixed} returning The array of returned columns or a string
	 * @return {Promise} a resulting promise of data or error on failure
     */
	update(where, data, returning) {
		data = this.__cleanIncommingData(data);
		if (!where || ['object', 'string', 'number'].indexOf(typeof where) < 0) throw new ModelError('Must use where criteria in update as either an ID or object containing col: value');
		if (typeof where !== 'object') where = { id: where };
		if (Object.keys(where).length < 1) throw new ModelError('Must have at least one where criteria in where object');

		let dl = 0;
		let qu = Object.keys(data).map((d, i) => {
			dl++;
			if (!this.columns[d] || this.columns[d].type !== 'point') return ` ${this.inject(d)} = $${(dl)} `;
			dl++; // points have two bits of data
			return ` ${this.inject(d)} = POINT($${(dl - 1)}, $${(dl)}) `;
		}).join(','); 
		let qw = Object.keys(where).map((w, i) => ` ${this.inject(w)} = $${(i + 1 + dl)} `).join(' AND ');
		// flatten any point data
		let v = [...Object.values(data).flatMap((d) => d && !isNaN(d.x) && !isNaN(d.y) ? [d.x, d.y] : d), ...Object.values(where)];
		let r = typeof returning === 'string' ? `RETURNING ${this.inject(returning)}` : (Array.isArray(returning) ? 'RETURNING ' + returning.map((ret) => this.inject(ret)).join(',') : '');

		return this.db.query(`UPDATE ${this.inject(this.table)} SET ${qu} WHERE ${qw} ${r};`, v)
			.then((res) => res.rows || [])
			.catch((error) => {
				if (error.code == 23505) throw new ModelError('Cannot duplicate a unique value, value already exists', this.columns);
				throw error;
			});
	}
	
	/**
     * @public @method delete
	 * @description Delete a single resource in a single table by table id
     * @param {Number} id The resource id to delete
     * @return {Promise} a resulting promise of data or error on failure
     */
	delete(id, type) { 
		// soft delete off and not explicitly soft, or explicitly hard
		if ((!this.softDelete && type !== 'soft') || type === 'hard') return this.db.query(`DELETE FROM ${this.inject(this.table)} WHERE id = $1;`, [id]);
	
		return this.db.query(`UPDATE ${this.inject(this.table)} SET ${this.inject(this.deleteCol)} = $1 WHERE ${this.inject(this.idCol)} = $2;`, [new Date(), id]);
	}

    /**
     * @public @method restore
	 * @description Soft restore a single resource (undelete) in a single table that has been soft deleted
     * @param {Number} id The resource id to soft restore
     * @return {Promise} a resulting promise of data or error on failure
     */
	restore(id) {
		return this.db.query(`UPDATE ${this.inject(this.table)} SET ${this.inject(this.deleteCol)} = $1 WHERE ${this.inject(this.idCol)} = $2;`, [null, id]);
	}

    /**
     * @public @method mapDataToColumn
	 * @description Map all incoming data, to columns to make sure we have a full dataset, or send partial flag true to map only partial dataset
     * @param {Object} data The data to check against the columns
     * @param {Boolean} partial The flag to force a partial map on only data available in dataset
     * @return {Object} a resulting promise of data or error on failure
     */
	mapDataToColumn(data, partial) {
		if (!this.columns) throw new ModelError('Cannot map data without setting columns getter in model [' + DataTools.snakeToCamel(this.table.split('.')[1]) + ']');
		
		// single entry
		let clean = {};
		for (const key in this.columns) {
			let dataKey = DataTools.snakeToCamel(key);
			if ((!data || data[dataKey] === undefined || data[dataKey] === null) && this.columns[key].required && !partial) {
				let columns = Object.keys(this.columns).reduce((p, c) => ({...p, ...{[DataTools.snakeToCamel(c)]: this.columns[c]}}), {});
				throw new ModelError('Invalid data, required property [' + dataKey + '] missing from [' + DataTools.snakeToCamel(this.table.split('.')[1]) + ']', columns);
			}

			if (data[dataKey] !== undefined && data[dataKey] !== null) {
				if (!DataTools.checkType(data[dataKey], this.columns[key].type)) {
					let columns = Object.keys(this.columns).reduce((p, c) => ({...p, ...{[DataTools.snakeToCamel(c)]: this.columns[c]}}), {});
					throw new ModelError('Invalid data, property [' + dataKey + '] type incorrect for [' + DataTools.snakeToCamel(this.table.split('.')[1]) + ']', columns);
				}

				// check for point types
				if (this.columns[key].type.split('[')[0].toLowerCase().includes('point') && (!data[dataKey] || isNaN(data[dataKey].x) || isNaN(data[dataKey].y))) {
					let columns = Object.keys(this.columns).reduce((p, c) => ({ ...p, ...{ [DataTools.snakeToCamel(c)]: this.columns[c] } }), {});
					throw new ModelError('Invalid data, property [' + dataKey + '] type incorrect, requires point data as {x: ..., y: ... } for [' + DataTools.snakeToCamel(this.table.split('.')[1]) + ']', columns);
				}

				clean[key] = this.columns[key].type.split('[')[0].toLowerCase().indexOf('json') < 0 ? data[dataKey] : (typeof data[dataKey] === 'string' ? data[dataKey] : JSON.stringify(data[dataKey]));
			} else if (data[dataKey] === null) {
				clean[key] = null;
			}
		}

		// empty
		if (partial && Object.keys(clean).length < 1) {
			let columns = Object.keys(this.columns).reduce((p, c) => ({...p, ...{[DataTools.snakeToCamel(c)]: this.columns[c]}}), {});
			throw new ModelError('Invalid data, must have at least one property in [' + DataTools.snakeToCamel(this.table.split('.')[1]) + ']', columns);
		}

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
		if (!data || !data.length) throw new ModelError('Data must be an array of data objects for [' + DataTools.snakeToCamel(this.table.split('.')[1]) + ']');

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
	 * @public @method inject
	 * @description Prepares text to inject into SQL directly for column names and such removing bad chars, quoting non * refs. WARNING! only inject variables for column names etc, NOT data!
	 * @param {String} text The string to inject into SQL that needs cleaning
	 * @return {String} a cleaned string
	 */
	inject(text) {
		text = text.replace(/[^a-zA-Z0-9_.*]/g, '');
		return text.split('.').map((t) => t === '*' ? t : `"${t}"`).join('.');
	}

    /**
     * @private @method __cleanIncommingData
	 * @description Clean any incomming data free of default values set by the DB directly
     * @param {Mixed} data The resource data to clean or array of data
     * @param {Bool} skipId Should we skip ID
     * @return {Mixed} The cleaned data object or array of objects
     */
	__cleanIncommingData(data, skipId) {
		if (!data) return;

		if (data.length > 0) {
			let dataArray = [];
			for (let i = 0; i < data.length; i++) dataArray.push(this.__cleanIncommingData(data[i]));
			return dataArray;
		}

		let cleaned = Object.assign({}, data);
		
		if (this.idCol && cleaned[this.idCol] && !skipId) delete cleaned[this.idCol];
		if (this.createdCol && cleaned[this.createdCol]) delete cleaned[this.createdCol];
		if (this.updatedCol && cleaned[this.updatedCol]) delete cleaned[this.updatedCol];
		if (this.deletedCol && cleaned[this.deletedCol]) delete cleaned[this.deletedCol];

		return cleaned;
	}
}

module.exports = ModelPG;
