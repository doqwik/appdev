const Services = require('../../../models/services');
const subServices = require('../../../models/sub_services');

const OtpGeneration = require("../../../util/otpGeneration");
const OtpVerification = require("../../../util/otpVerification");
const AuthToken = require("../../../util/authToken");
const userCache = require("../../../util/userCache");
const mongoose = require("mongoose");
const {
  userAuthIssuerName,
  roles: { USER },
  authTokenUserAuthExpiresIn,
} = require("../../../config/constant");
//Select All by condition
exports.getData = async function (options,type) {
  try {
    const { condition={}, sort={},skip,limit } = options;
    if(type == 'count'){
      return await subServices.find(condition).count();
    } else {
      return await subServices.find(condition).sort(sort).skip(skip).limit(limit);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}//End of function

//Select only one by condition
exports.getOnlyOneData = async function (options) {
  try {
    const { condition={}, sort={},skip,limit } = options;
    return await subServices.findOne(condition).sort(sort).skip(skip).limit(limit).populate('service_oid');
  } catch (error) {
    return Promise.reject(error);
  }
}//End of function

