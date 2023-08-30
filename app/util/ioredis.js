const Redis = require("ioredis");


// client instance holder
let redisClient = null;

/**
 * Get redis client instance.
 * @returns {Redis} redis client instance
 */
function redis() {
    // lazy init
    if (!redisClient) {
        redisClient = new Redis(process.env.REDIS_URL);
    }

    // return instance
    return redisClient;
}

/**
 * Redis instance accessor.
 * @type {redis}
 */
module.exports = redis;
