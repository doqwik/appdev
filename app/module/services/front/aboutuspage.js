const AboutUspage  = require('../../../models/aboutuspage');
const Banner  = require('../../../models/banner');
const AboutData  = require('../../../models/aboutdata');
const Testimonial  = require('../../../models/testimonails');
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

exports.getAboutpageData = async function (options, type) {
  try {
    const { condition = {}, sort = {}, skip, limit } = options;
    if (type === 'count') {
      return await AboutUspage.find(condition).count();
    } else {
      return await AboutUspage.find(condition).sort(sort).skip(skip).limit(limit);
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
      condition.title = "About Page";
      return await Banner.find(condition).sort(sort).skip(skip).limit(limit);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

exports.getaboutData = async function (options, type) {
  try {
    const { condition = {}, sort = {}, skip, limit } = options;
    if (type === 'count') {
      return await AboutData.find(condition).countDocuments();
    } else {
      // Add the condition to filter banners with title "home"
      condition.title = "Home Page";
      return await AboutData.find(condition).sort(sort).skip(skip).limit(limit);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

exports.getTestimonialData = async function (options, type) {
  try {
    const { condition = {}, sort = {}, skip, limit } = options;
    if (type === 'count') {
      return await Testimonial.find(condition).count();
    } else {
      return await Testimonial.find(condition).sort(sort).skip(skip).limit(limit);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};