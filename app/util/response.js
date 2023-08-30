const constant      = require(__basePath + 'app/config/constant');
const config        = require('../util/responseMessageConfiguration');
const exception     = require("node-exceptions");
const messagePrefix = "APP_MESSAGES:";

/**
 * Build API Response
 * @param {String} key response message suffix key
 * @param {Object} res Result object
 * @returns {Object}
 */
module.exports.build = function (key, response) {
    response = response || {};
    if(response.error && isResponseObject(response.error)) return response.error;
    else if(response.result && isResponseObject(response.result)) return response.result;

    const error = (response && response.error) || {};
    const responseObj = config.get(messagePrefix + error.message) || config.get(messagePrefix + key) || config.get(messagePrefix + "ERROR_SERVER_ERROR");

    return {
        status: key === 'SUCCESS',
        statusCode: responseObj.errorCode,
        statusMessage: responseObj.message || response.message,
        responseCode: responseObj.statusCode,
        response: response
    };
};

/**
 * Build Error Response
 * @param {String} key Response message suffix key
 * @param {String} exceptionClass Exception class name
 */
module.exports.error = function (key, exceptionClass = 'LogicalException') {
    const responseObj = config.get(messagePrefix + key);
    return new exception[exceptionClass](responseObj.message, responseObj.statusCode, responseObj.errorCode);
};

module.exports.sendResponse = function(res, response){
    res.status(response.responseCode || 500).json(response);
}

function isResponseObject(responseObj){
    return responseObj.statusCode && responseObj.responseCode ? true : false;
}