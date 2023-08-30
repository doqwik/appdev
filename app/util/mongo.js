const fs = require('fs');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const connections = {};

/**
 * create db connection
 * @method
 * @param {String} dbName
 * @returns {Object} db instance 
 */
exports.dbConnection = async function() {
    try {
        const options = {
            keepAlive: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
//            ssl: true,
//	    sslValidate: true,
//            sslCA: fs.readFileSync('./rds-combined-ca-bundle.pem')

        };
        mongoose.set("strictQuery", true);
        await mongoose.connect(process.env.MONGO_URL, options);
        return mongoose.connection;
    } catch (error) {
        return Promise.reject(error);
    }
}

/**
 * create db connection
 * @method
 * @param {String} dbName
 * @returns {Object} db instance 
 */
exports.getInsuranceDbConnection = async function(dbName) {
    if(connections[dbName]) {
        return connections[dbName];
    } else {
        try {
            const options = {
                useNewUrlParser: true,
                useUnifiedTopology: true
            };
            let client = await MongoClient.connect(process.env.MONGO_INSURANCE_URL, options);
            connections[dbName] = client.db(dbName);
            return connections[dbName];
        } catch (error) {
            return Promise.reject(error);
        }
    }
}
