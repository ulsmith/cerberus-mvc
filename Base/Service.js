'use strict';

const Core = require('../System/Core.js');

/**
 * @namespace MVC/Base
 * @class Service
 * @extends Core
 * @description System class to give a base for creating services
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT 
 */
class Service extends Core {

	/**
	 * @public @method constructor
	 * @description Base method when instantiating class
	 */
	constructor() {
		super();
	}
}

module.exports = Service;