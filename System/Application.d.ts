import Response from'./Response';

/**
 * @module cerberus-mvc/System/Application
 * @class Application
 * @description System application handler, talking back to lambda to bridge LAPI with AWS
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
*/
export default class Application<T> {
	
	public globals: T;

	constructor(type: 'aws' | 'azure' | 'express' | 'socket', mode?: 'mjs-es-module' | 'es-module' | 'module' | undefined | null, workingDir?: string | undefined | null, controllerDir?: string | undefined | null, forceGlobals?: boolean);

	service<TS>(s: TS | TS[]);

	middleware<TM>(mw: TM | TM[]);

	middlewareInit<TMI>(mw: TMI);

	middlewareMount<TMM>(mw: TMM);

	middlewareIn<TMIN>(mw: TMIN);

	middlewareOut<TMO>(mw: TMO);

	middlewareEnd<TME>(mw: TME);

	async run(data: any): Promise<Response>;
}
