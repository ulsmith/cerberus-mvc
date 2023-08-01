import Core from '../System/Core';

/**
 * @module cerberus-mvc/Base/Model
 * @class Model
 * @extends Core
 * @description System class to give a base for creating models, exposing the knex DB service and giving base methods
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 * @deprecated [Model.js] removal estimated in V1.1, switch to ModelKnex or use Model[DB Engine] for raw model access
 */
export default abstract class Model<T> extends Core<T> {
	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor(dbname: string, table: string);

	get db(): any;

	get model(): any;

	get(id: any): any;

	find(where: any): any;

	all(): any;

	transaction(func: any): any;

	insert(data: any, returning: any): any;

	transactInsert(trx: any, data: any, returning: any): any;

	update(where: any, data: any, returning: any): any;

	transactUpdate(trx: any, where: any, data: any, returning: any): any;

	delete(id: any): any;

	transactDelete(trx: any, id: any): any;

	softDelete(id: any): any; 

	softRestore(id: any): any;

	mapDataToColumn(data: any, partial: any): any;

	mapDataArrayToColumn(data: any, partial: any): any;

	parseError(error: any): any;

	checkColumnsStrict(data: any): any;
	
	private cleanIncommingData(data: any): any;
}
