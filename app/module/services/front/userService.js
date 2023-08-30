const User = require('../../../models/users');
const UserAddress = require('../../../models/users_address');
const Notification = require('../../../models/notification');
const Feedback = require('../../../models/feedback');
const Services = require('../../../models/services');
const UserSlot = require('../../../models/users_slot');
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
exports.createNotification = async function(userParam) {
  try {
    //return await User.create(userData);
    return await Notification.create(userParam);
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.getNotificationData = async function (options,type) {
  try {
    const { condition={}, sort={},skip,limit } = options;
    if(type == 'count'){
      return await Notification.find(condition).count();
    } else {
      return await Notification.find(condition).sort(sort).skip(skip).limit(limit);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}
exports.getDataById = async function (options) {
  try {
    const { condition={},select={} } = options;
    return await User.findOne(condition).select(select);
  } catch (error) {
    return Promise.reject(error);
  }
}
exports.getAddressDataById = async function (options) {
  try {
    const { condition={} } = options;
    return await UserAddress.find(condition);
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.removeAdddresbyID = async function (options) {
  try {
    const { condition={} } = options;
    return await UserAddress.deleteOne(condition);
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


exports.createData = async function(userParam) {
  try {
    const userData = await User.create(userParam);
    if (userData) {
      await userCache.invalidate(userData._id);
      return User.findByIdAndUpdate(userData._id, {}, { new: true });
    }
  } catch (error) {
    return Promise.reject(error);
  }
};


exports.createDataAddress = async function(userParam) {
  try {
    //return await User.create(userData);
    return await UserAddress.create(userParam);
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.createDataFeedback = async function(userParam) {
  try {
    //return await User.create(userData);
    return await Feedback.create(userParam);
  } catch (error) {
    return Promise.reject(error);
  }
}


exports.updateData = async function (options) {
  const { condition={}, data } = options;
  try {
    return await User.findOneAndUpdate(condition, data, {new: true});
  } catch (error) {
    return Promise.reject(error);
  }
}


exports.updateaddressData = async function (options, data) {
  const { condition } = options;
  try {
    return await UserAddress.findOneAndUpdate(condition, data, { new: true });
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.deleteData = async function (options) {
  const { condition={} } = options;
  try {
    return await User.deleteOne(condition);
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.getUserLogin = async function (options) {
  try {
    const { condition={}, device_id } = options;  
    const userData = await User.findOne(condition);
    if(userData){
      // generate auth token
      const token = await AuthToken.generateToken(
        userData._id,
        USER,
        userAuthIssuerName,
        authTokenUserAuthExpiresIn
      );
      await userCache.invalidate(userData._id);
      await userCache.setToken(userData._id, token);
      await User.findOneAndUpdate({_id:userData._id}, {token:token, ...(device_id?{device_id:device_id}:null)});
      return await User.findById(userData._id).populate('addressData defaultAddress');
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.getUserById = async function (id) {
  try {
    return await User.findById(id);
  } catch (error) {
    return Promise.reject(error);
  }
}


