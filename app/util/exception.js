const _ = require("lodash");
const NodeException = require("node-exceptions");
const constant = require('../config/constant');
const config = require('../util/responseMessageConfiguration');
const { writeLogError } = require('../util/logger');

//Services Exception
class ApplicationException extends NodeException.LogicalException {
    constructor(errorKey = "ERROR_SERVER_ERROR", messageVariables = {}) {
        super();

        const error   = config.get(`APP_MESSAGES:${errorKey}`);
        this.message  = _.template(error.message)(messageVariables);
        this.status   = error.statusCode;
        this.code     = error.errorCode;
        this.response = this.response || {};
    }
}

class ValidationErrorException extends ApplicationException {
    constructor(response = {}) {
        super("ERROR_VALIDATION");
        this.response = response;
    }
}

class UnsupportedServiceActionException extends ApplicationException {
    constructor() {
        super('ERROR_UNSUPPORTED_SERVICE');
    }
}

/*
 * Error Handler 
 */
const errorHandler = function (err, req, res, next) {
    let errResponse = {
        status       : false,
        statusMessage: err.message,
        statusCode   : err.code,
        response     : err.response
    };

    writeLogError(['errorHandler', 'emitted', errResponse]);
    return res.status(err.status || 500).json(errResponse);
};

/*
 * Error Handler 
 */
const unknownRouteHandler = function (req, res, next) {
    return next(new UnsupportedServiceActionException);
};

module.exports = {
    ValidationErrorException: ValidationErrorException,
    errorHandler: errorHandler,
    unknownRouteHandler: unknownRouteHandler,
};