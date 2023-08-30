const axios = require('axios');
const constant = require('../config/constant')

/**
 * Make HTTP call using axios
 * @method
 * @param {String} method
 * @param {String} url
 * @param {Object} data
 * @param {Object} headers
 * @return {Promise}
 */
exports.makeHttpCall = async function (method, url, data, headers={}) {
    try {
        const requestData = {
            method,
            url,
            headers: { ...{ 'content-type': 'application/json', 'partnerSecret': constant.PARTNER_SECRET}, ...headers}
        };
        if(data) requestData['data'] = data;
        return await axios(requestData);
    } catch (error) {
        if(error.response.status == 404){
            return error.response;
        } else {
            return Promise.reject(error);
        }
    }
};
