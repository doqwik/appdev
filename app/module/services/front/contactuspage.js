const Contactuspage  = require('../../../models/contactuspage');
const ContactSecondPage  = require('../../../models/contactsecond');
const Banner  = require('../../../models/banner');
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

exports.getContactuspageData = async function (options, type) {
  try {
    const { condition = {}, sort = {}, skip, limit } = options;
    if (type === 'count') {
      return await Contactuspage.find(condition).count();
    } else {
      return await Contactuspage.find(condition).sort(sort).skip(skip).limit(limit);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

exports.getBannerData = async function (options, type) {
  try {
    const { condition = {}, sort = {}, skip, limit } = options;
    if (type === 'count') {
      return await Banner.find(condition).countDocuments();
    } else {
      // Add the condition to filter banners with title "home"
      condition.title = "Contact Page";
      return await Banner.find(condition).sort(sort).skip(skip).limit(limit);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

exports.getContactsecondData = async function (options, type) {
  try {
    const { condition = {}, sort = {}, skip, limit } = options;
    if (type === 'count') {
      return await ContactSecondPage.find(condition).count();
    } else {
      return await ContactSecondPage.find(condition).sort(sort).skip(skip).limit(limit);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};
