const User = require('../../../models/orderplace');
const OtpGeneration = require("../../../util/otpGeneration");
const Services = require('../../../models/services');
const UserSlot = require('../../../models/users_slot');
const Order = require('../../../models/orderplace');
const COUPON = require('../../../models/coupon');
const OtpVerification = require("../../../util/otpVerification");
const AuthToken = require("../../../util/authToken");
const userCache = require("../../../util/userCache");
const mongoose = require("mongoose");
const {
  userAuthIssuerName,
  roles: { USER },
  authTokenUserAuthExpiresIn,
} = require("../../../config/constant");

exports.createData = async function(userData) {
  try {
    return await User.create(userData);
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.createCouponData = async function(userData) {
  try {
    return await COUPON.create(userData);
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.getCouponDetail = async function (options) {
  try {
    const { condition={} } = options;
    return await COUPON.find(condition);
  } catch (error) {
    return Promise.reject(error);
  }
}
exports.getData = async function (options,type) {
  try {
    const { condition={}, sort={},skip,limit } = options;
    if(type == 'count'){
      return await User.find(condition).count();
    } else {
      return await User.find(condition).sort(sort).skip(skip).limit(limit);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.getOrderDetailByType = async function (options) {
  try {
    const { condition={} } = options;
    return await User.find(condition);
  } catch (error) {
    return Promise.reject(error);
  }
}
exports.getslotDetailByType = async function (options) {
  try {
    const { condition={} } = options;
    return await UserSlot.find(condition);
  } catch (error) {
    return Promise.reject(error);
  }
}
exports.getOrderDetailId = async function (options) {
  try {
    const { condition={} } = options;
    return await User.find(condition);
  } catch (error) {
    return Promise.reject(error);
  }
}
exports.createDataOrder = async function(userParam) {
  try {
    //return await User.create(userData);
    return await User.create(userParam);
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.createDataSlot = async function(userParam) {
  try {
    //return await User.create(userData);
    return await UserSlot.create(userParam);
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.getServiceByType = async function (options) {
  try {
    const { condition={} } = options;
    return await Services.find(condition);
  } catch (error) {
    return Promise.reject(error);
  }
}
exports.updateData = async function (options, data) {
  const { condition } = options;
  try {
    return await User.findOneAndUpdate(condition, data, { new: true });
  } catch (error) {
    return Promise.reject(error);
  }
}
exports.updateslotData = async function (options, data) {
  const { condition } = options;
  try {
    return await UserSlot.findOneAndUpdate(condition, data, { new: true });
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.getslotDataById = async function (options) {
  try {
    const { condition={} } = options;
    return await UserSlot.find(condition);
  } catch (error) {
    return Promise.reject(error);
  }
}


exports.getorderDataById = async function (options) {
  try {
    const { condition={} } = options;
    return await Order.find(condition);
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.updateorderData = async function (options, data) {
  const { condition } = options;
  try {
    return await Order.findOneAndUpdate(condition, data, { new: true });
  } catch (error) {
    return Promise.reject(error);
  }
}