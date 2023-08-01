import AWS from 'aws-sdk';

/**
 * @module cerberus-mvc/Service/Dynamo
 * @class Dynamo
 * @description Service class providing database connection using knex.js
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 * @example
 * new Dynamo('192.168.1.10', 5432, 'your_db', 'your_key', 'your_secret', 'region');
 */
export default class Dynamo {
    public dynamo: AWS.DynamoDB;
    public client: AWS.DynamoDB.DocumentClient;
    public name: string;
    public service: string;
    public host: string;
    public port: number;
    public db: string;

    /**
     * @public @method constructor
     * @description Base method when instantiating class
     */
    constructor(host: string, port: number, db: string, key: string, secret: string, region: string)
}