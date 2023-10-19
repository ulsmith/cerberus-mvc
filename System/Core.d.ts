export default abstract class Core<T> {
	private globals: T;

	constructor(globals?: T);

	get $globals(): T;

	get $environment(): T['$environment'];

	/**
	 * @public @get client
	 * @desciption Get the client data available to the system
	 * @return {Object} Middleware available
	 */
	get $client(): T['$client'];

	/**
	 * @public @get services
	 * @desciption Get the services available to the system
	 * @return {Object} Services available
	 */
	get $services(): T['$services'];
	
	/**
	 * @public @get socket
	 * @desciption Get the socket available to the system
	 * @return {Object} socket available
	 */
	get $socket(): T['$socket'];

	/**
	 * @public @get io
	 * @desciption Get the io available to the system
	 * @return {Object} io available
	 */
	get $io(): T['$io'];
};
