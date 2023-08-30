const moment = require("moment");
const _ = require("lodash");
const VerifyOtp = require('../models/verifyOtps');
const {OtpRetry} = require("../config/constant");

/**
 * Numeric characters string: 0-9.
 * @type {string}
 */
const NUMERIC = "0123456789";

class OtpGeneration {
    /**
   * Generate a string of given length of random numeric digits.
   * @param {Number} length - desired output length. Must be > 0;
   * @return {string} generated output string.
   */
    static randomNumeric(length) {
        if (!_.isNumber(length) || length < 1) {
            throw new Error("length should be a non zero number.");
        }

        let random = [];
        for (let i = 0; i < length; i++) {
            random.push(NUMERIC[_.random(0, NUMERIC.length - 1)]);
        }

        return random.join("");
    }

    static async canOtpGenerated(phone){
        const condition = {"phone":phone}
        const record = await VerifyOtp.findOne(condition).sort({createdOn:-1});
        if(record){
            //check for retry
            if (moment().isBefore(moment(record.createdOn).add(OtpRetry.value, OtpRetry.duration))) throw new Error("Request already sent try after sometime.");
        }
        return record;
    }

    static async canUserOtpGenerated(email){
        const condition = {"email":email}
        const record = await VerifyOtp.findOne(condition).sort({createdOn:-1});
        if(record){
            //check for retry
            if (moment().isBefore(moment(record.createdOn).add(OtpRetry.value, OtpRetry.duration))) throw new Error("Request already sent try after sometime.");
        }
        return record;
    }

    static async saveOtp(data) {
        //update createdOn
        data["createdOn"] = moment();
        return await VerifyOtp.create(data);
    }
}

/**
 * @type {OtpGeneration}
 */
module.exports = OtpGeneration;