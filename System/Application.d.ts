import Response from'./Response';

/**
 * @module cerberus-mvc/System/Application
 * @class Application
 * @description System application handler, talking back to lambda to bridge LAPI with AWS
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
*/
export default class Application {
	
	constructor(type: 'aws' | 'azure' | 'express' | 'socket', mode?: 'es-module' | 'module' | undefined | null, workingDir?: string | undefined | null, controllerDir?: string | undefined | null);

	service<T>(s: T | T[]);

	middleware<T>(mw: T | T[]);

	middlewareInit<T>(mw: T);

	middlewareMount<T>(mw: T);

	middlewareIn<T>(mw: T);

	middlewareOut<T>(mw: T);

	middlewareEnd<T>(mw: T);

	async run(data: any): Promise<Response>;
}
