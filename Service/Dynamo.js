'use strict';

var AWS = require('aws-sdk');

/**
 * @namespace MVC/Service
 * @class Dynamo
 * @description Service class providing database connection using knex.js
 * @author Paul Smith (ulsmith) <p@ulsmith.net> <pa.ulsmith.net>
 * @copyright 2020 Paul Smith (ulsmith) all rights reserved
 * @license MIT
 * @example
 * new Dynamo('192.168.1.10', 5432, 'your_db', 'your_key', 'your_secret', 'region');
 */
class Dynamo {

    /**
     * @public @method constructor
     * @description Base method when instantiating class
     */
    constructor(host, port, db, key, secret, region) {
        // create dynamo
        AWS.config.update({
            region: region,
            endpoint: `http://${host}:${port}`,
            accessKeyId: key,
            secretAccessKey: secret
        });

        // generate service
        this.dynamo = new AWS.DynamoDB;
        this.client = new AWS.DynamoDB.DocumentClient();
        this.name = 'dynamo';
        this.service = 'dynamo:' + db;
        this.host = host;
        this.port = port;
        this.db = db;
    }
}

module.exports = Dynamo;