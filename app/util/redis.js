const redis = require('redis');
const {writeLogErrorTrace} = require('../util/logger');

const client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
});

client.on('error', err => {
    writeLogErrorTrace(['[util redis]', '[utility] Error: ', err]);
});

module.exports = client;