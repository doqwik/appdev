const Banner  = require('../../../models/banner');
const Services  = require('../../../models/services');
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

exports.getBannerData = async function (options, type) {
  try {
    const { condition = {}, sort = {}, skip, limit } = options;
    if (type === 'count') {
      return await Banner.find(condition).countDocuments();
    } else {
      // Add the condition to filter banners with title "home"
      condition.title = "Service Page";
      return await Banner.find(condition).sort(sort).skip(skip).limit(limit);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};


exports.getservicesData = async function (options, type) {
  try {
    const { condition = {}, sort = {}, skip, limit } = options;
    if (type === 'count') {
      return await Services.find(condition).count();
    } else {
       // const userData = {'test' : "afsar"};
     //   return await Services.create(userData);
      return await Services.find(condition).sort(sort).skip(skip).limit(limit);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};


