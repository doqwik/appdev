const _ = require('lodash');
const validation = {};

validation.validationDefaultObject =  {
    abortEarly  : false,
    stripUnknown: true,
    convert     : true,
    language    : {
        any : {
            required    : "{{label}} is required"
        }
    }
};

validation.parseError =  (errorContext) => {
    let errorObject = {};
    _.each(errorContext.details, (detail) => {
        errorObject[detail.context.key] = detail.message;
    });
    return errorObject;
}

module.exports = validation;