const _ = require("lodash");
const redis = require("./ioredis");

// redis key prefix
const providerCacheKeyPrefix = "PROVIDER-TOKEN_";

/**
 * Get user token from redis.
 * @param {number} userId
 * @returns {Promise<object>} user
 */
async function getToken(userId) {
  // cache key
  const key = providerCacheKeyPrefix + userId;
  return await redis().get(key);
}

/**
 * @type {getToken}
 */
module.exports.getToken = getToken;

/**
 * set user token into redis.
 * @param {number} userId
 * @returns {Promise<object>} user
 */
async function setToken(userId, token) {
  // cache key
  const key = providerCacheKeyPrefix + userId;
  return await redis().set(key, _.trim(token));
}

/**
 * @type {setToken}
 */
module.exports.setToken = setToken;

/**
 * Invalidate user for id
 * @param {number} userId
 */
async function invalidate(userId) {
  // redis key
  const key = providerCacheKeyPrefix + userId;

  // delete key in redis
  return await redis().del(key);
}

/**
 * @type {invalidate}
 */
module.exports.invalidate = invalidate;
