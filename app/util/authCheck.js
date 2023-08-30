const _ = require("lodash");
const authToken = require("./authToken");
const userCache = require("./userCache");
const provicerCache = require("./providerCache");
const response = require("./response");

const userService = require('../module/services/front/userService');
const providerService = require('../module/services/front/providerService');

/**
 * Perform auth toke check, adds user to request on success
 * @param {Request} req request
 * @param {Response} res response
 */
module.exports = async function authorize(req, res, next) {
  try {
    // get auth token
    const token = req.get("Authorization") || req.query["authToken"];
    // auth token must be supplied
    if (_.isNil(token) || token.length < 1) {
      return response.sendResponse(
        res,
        response.build("UNAUTHORIZED", { error: "Auth Token is required" })
      );
    }
    // verify auth signature
    const decodedToken = await authToken.verifyAuthToken(token);
    //single device login check.
    let userToken;
    if(decodedToken.iss === 'PROVIDER'){
      userToken = await provicerCache.getToken([decodedToken.data.userId]);
    }else{
      userToken = await userCache.getToken([decodedToken.data.userId]);
    }
    
    const user = decodedToken.data;
    //user not found
    if (!user || userToken != token) {
      return response.sendResponse(
        res,
        response.build("UNAUTHORIZED", { error: "Invalid or Expired Token" })
      );
    }
    if(user.userType == 'ADMIN'){
      const adminData = await adminService.getAdminById(user.userId);
      user.email  = adminData.email;
      user.phone  = adminData.phone;
      user.adminType  = adminData.adminType;
    } else if(user.userType == 'USER'){
      const userData = await userService.getUserById(user.userId);
      user.email  = userData.email;
    } else if(user.userType == 'PROVIDER'){
      const userData = await providerService.getUserById(user.userId);
      user.phone  = userData.phone;
    }
    // set as request property
    _.set(req, "user", user);
    next();
  } catch (error) {
    return response.sendResponse(
      res,
      response.build("UNAUTHORIZED", { error: "Invalid or Expired Token" })
    );
  }
};
