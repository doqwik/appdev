const moment = require("moment");
const _ = require("lodash");
const VerifyOtp = require('../models/verifyOtps');
const { OtpExpiry } = require("../config/constant");

class OtpVerification {
  /**
   *
   * @param {Object} data
   */
  static async isValidOtp(data) {
    //for testing, to be removed
    // if(data.code == 1111) return true;
    const condition = { code: data.code,phone:data.phone };
    const record = await VerifyOtp.findOne(condition);
    if (record) {
      //check for expiry
      if (
        moment().isAfter(
          moment(record.createdOn).add(OtpExpiry.value, OtpExpiry.duration)
        )
      )
        return false;
      //update otp verification
      await VerifyOtp.remove(condition);
      return true;
    }
    return false
    // throw new Error("Invalid otp");
  }

  static async isValidUserOtp(data) {
    //for testing, to be removed
    //if(data.code == 123456) return true;
    const condition = { code: data.code,phone:parseInt(data.phone) };
    // console.log('condition',condition)

    const record = await VerifyOtp.findOne(condition);
    if (record) {
      //check for expiry
      if (
        moment().isAfter(
          moment(record.createdOn).add(OtpExpiry.value, OtpExpiry.duration)
        )
      )
        //return false;
      //update otp verification
      await VerifyOtp.remove(condition);
      return true;
    }
    return false
    //throw new Error("Invalid otp");
  }
}

/**
 * @type {OtpVerification}
 */
module.exports = OtpVerification;
