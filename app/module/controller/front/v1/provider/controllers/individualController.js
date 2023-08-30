const userService = require('../../../../../services/front/userService');
const providerService = require('../../../../../services/front/providerService');
const Counter = require('../../../../../services/front/counterService');
const order = require('../../../../../services/front/orderplace');
const response = require('../../../../../../util/response');
const {writeLogErrorTrace} = require('../../../../../../util/logger');
const {isValidObjectId} = require('../../../../../../util/valueChecker');
const AuthToken = require("../../../../../../util/authToken");
const providerCache = require("../../../../../../util/providerCache");
const OtpGeneration = require("../../../../../../util/otpGeneration");
const OtpVerification = require("../../../../../../util/otpVerification");

const _ = require("lodash");
const {
  USERTYPE
} = require("../../../../../../config/constant");


/* ********************************************************************************
* Function Name   : login
* Purposes        : This function is used to generate OTP
* Creation Date   : 05-06-2023
* Created By      : Afsar Ali
* Update By       :
* Update Date     :
************************************************************************************/ 
exports.login = async function (req, res) {
  try {
    const {key} = req.headers;
    const{mobile}= req.body;
    if(!mobile){
      return response.sendResponse(res, response.build('PHONE_EMPTY', {}));
    }else{
      //check if otp generated within given time
      await OtpGeneration.canOtpGenerated(mobile)
      // generate random 4 digit OTP code
      const code = 123456;//OtpGeneration.randomNumeric(6); 
      //prepare data
      const record = { 
        "phone":mobile, 
        "code":code 
      };    
      //save to verifcation table
      await OtpGeneration.saveOtp(record); 
      const payload = {
        mobile: mobile,
        Message: `Your One Time Password is: ${code}`
      }
      if(payload){   
        return response.sendResponse(res, response.build('SUCCESS', {result: payload}));
      } else{ 
        return response.sendResponse(res, response.build('ERROR_INVALID_MOBILENUMBER', {}));
      }
    }
  } catch(error) { 
      return response.sendResponse(res, response.build('REQUEST_ALREADY_SENT', {}));
  }
} //END OF FUNCTION

/* ********************************************************************************
* Function Name   : verify_login_otp
* For             : APP and Web
* Purposes        : This function is used to generate OTP
* Creation Date   : 30-05-2023
* Created By      : Afsar Ali
* Update By       :
* Update Date     :
************************************************************************************/ 
exports.verify_login_otp = async function (req, res) {
  try {
      const{mobile,otp}= req.body; 
      if(!mobile){
        return response.sendResponse(res, response.build('PHONE_EMPTY', {}));
      }else if(!otp){
        return response.sendResponse(res, response.build('OTP_EMPTY', {}));
      }else{
        const data = {
          code: otp,
          phone: mobile
        }
        const isverify = await OtpVerification.isValidUserOtp(data);
        if(isverify == true){
          const getUserOption = {
            condition: {"phone": parseInt(mobile)}
          }
          var providerData = await providerService.getUserLogin(getUserOption);
          
          if(providerData){
            res.setHeader("Authorization",providerData.token);
            return response.sendResponse(res, response.build('SUCCESS', {result: providerData}));
          }else{
            const providerData = {
              "phone": mobile,
              "flag" : "new_user"
            }
            return response.sendResponse(res, response.build('SUCCESS', {result: providerData}));
          } 
        }else{
          return response.sendResponse(res, response.build('ERROR_INVALID_CREDENTIAL', {}));
        }
      }
  } catch(error) { 
      return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', {error: error}));
  }
} //END OF FUNCTION
/* ********************************************************************************
* Function Name   : register
* For             : APP and Web
* Purposes        : This function is used to generate OTP
* Creation Date   : 06-06-2023
* Created By      : Afsar Ali 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.register = async function (req, res) {
  try {
      const { fullName, email, phone, country, state, city, address1, address2, land_mark, postal_code, userType, companyRegNo, tinNumber, bankAcountNumber, latitude, longitude, device_id, platform } = req.body;
      if(!fullName){
        return response.sendResponse(res, response.build('FULLNAME_EMPTY', {}));
      }else if(!email){
        return response.sendResponse(res, response.build('EMAIL_EMPTY', {}));
      }else if(!phone){
        return response.sendResponse(res, response.build('PHONE_EMPTY', {}));
      }else if(!country){
        return response.sendResponse(res, response.build('COUNTRY_EMPTY', {}));
      }else if(!state){
        return response.sendResponse(res, response.build('STATE_EMPTY', {}));
      }else if(!city){
        return response.sendResponse(res, response.build('CITY_EMPTY', {}));
      }else if(!land_mark){
        return response.sendResponse(res, response.build('LANDMARK_EMPTY', {}));
      }else if(!postal_code){
        return response.sendResponse(res, response.build('POSTALCODE_EMPTY', {}));
      }else if(!req.files.certificate){
        return response.sendResponse(res, response.build('DOCUMENT_EMPTY', {}));
      }else if(!companyRegNo){
        return response.sendResponse(res, response.build('COMPANYREGNO_EMPTY', {}));
      }else if(!tinNumber){
        return response.sendResponse(res, response.build('TINNUMBER_EMPTY', {}));
      }else if(!bankAcountNumber){
        return response.sendResponse(res, response.build('BANKACCOUNT_EMPTY', {}));
      }else{
        const where = { condition : { "phone" : phone } }
        const isUserAvailable = await providerService.getData(where,'count');
        if(isUserAvailable == 0){
          const addData = {
            fullName : fullName,
            email: email,
            phone: phone,
            country: country,
            state: state,
            city: city,
            address1: address1,
            address2: address2,
            land_mark: land_mark,
            postal_code: postal_code,
            userType : userType,
            companyRegNo : companyRegNo,
            tinNumber : tinNumber,
            bankAcountNumber : bankAcountNumber,
            ...(req.files.profile_pic[0].path ? {profile_pic: req.files.profile_pic[0].path} : null),
            ...(req.files.certificate[0].path ? {certificate: req.files.certificate[0].path} : null),
            creationDate: new Date(),
            isVerified : 1,
            status: "A",
            ...(latitude? {latitude : latitude}: null),
            ...(longitude? {longitude : longitude}: null),
            ...(device_id? {device_id : device_id}: null),
            ...(platform ? {platform : platform }: null)
          };
          const data = await providerService.createData(addData);
          
          return response.sendResponse(res, response.build('SUCCESS', { result: data }));
        }else{
          return response.sendResponse(res, response.build('SUCCESS', { result: {'message' : phone+" is already register with another users."} }));
        }
      }
  } catch (error) {
      writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
      return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
} //ENF OF FUNCTION
/* ********************************************************************************
* Function Name   : updateProfile
* For             : APP and Web
* Purposes        : This function is used to update profile
* Creation Date   : 06-06-2023
* Created By      : Afsar Ali 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.updateProfile = async function (req, res){
    try {
        const userId = req.user.userId;

        const { fullName, email, phone, country, state, city, address1, address2, land_mark, postal_code, companyRegNo, tinNumber, bankAcountNumber, device_id, platform } = req.body;
        if(!userId || !isValidObjectId(userId)) {
          return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
        } else if(!fullName){
          return response.sendResponse(res, response.build('FULLNAME_EMPTY', {}));
        } else if(!country){
          return response.sendResponse(res, response.build('COUNTRY_EMPTY', {}));
        } else if(!state){
          return response.sendResponse(res, response.build('STATE_EMPTY', {}));
        } else if(!city){
          return response.sendResponse(res, response.build('CITY_EMPTY', {}));
        } else if(!land_mark){
          return response.sendResponse(res, response.build('LANDMARK_EMPTY', {}));
        } else if(!postal_code){
          return response.sendResponse(res, response.build('POSTALCODE_EMPTY', {}));
        } else if(!companyRegNo){
          return response.sendResponse(res, response.build('COMPANYREGNO_EMPTY', {}));
        } else if(!tinNumber){
          return response.sendResponse(res, response.build('TINNUMBER_EMPTY', {}));
        } else if(!bankAcountNumber){
          return response.sendResponse(res, response.build('BANKACCOUNT_EMPTY', {}));
        } else {
          const data = {
              ...(fullName ? { fullName: fullName } : null),
              ...(country ? { country: country } : null),
              ...(state ? { state: state } : null),
              ...(city ? { city: city } : null),
              ...(address1 ? { address1: address1 } : null),
              ...(address2 ? { address2: address2 } : null),
              ...(land_mark ? { land_mark: land_mark } : null),
              ...(postal_code ? { postal_code: postal_code } : null),
              ...(companyRegNo ? { companyRegNo: companyRegNo } : null),
              ...(tinNumber ? { tinNumber: tinNumber } : null),
              ...(bankAcountNumber ? { bankAcountNumber: bankAcountNumber } : null),
              
              ...(req.files.profile_pic ? {profile_pic: req.files.profile_pic[0].path} : null),
              ...(req.files.certificate ? {certificate: req.files.certificate[0].path} : null),

              updateDate: new Date(),
            };
            
          const updateUserOption = {
              condition: {_id: userId},
              data: data
          };
          const updateUserResult = await providerService.updateData(updateUserOption);
          updateUserResult.token  = "";
          return response.sendResponse(res, response.build('SUCCESS', {result: updateUserResult._doc}));
        }
    } catch (error) {
        writeLogErrorTrace(['[provider users update]', '[controller] Error: ', error]);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', {error: error}));
    }
} // End of Function
/* ********************************************************************************
* Function Name   : logout
* For             : APP and Web
* Purposes        : This function is used to logout
* Creation Date   : 06-06-2023
* Created By      : Afsar Ali 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.logout = async function(req,res) {
    try{
        const userId = req.user.userId;
        if(!userId || !isValidObjectId(userId)) {
            return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
        }
        const result = await providerCache.invalidate(userId);
        const updateUserOption = {
            condition: {_id: userId},
            data: {token: ""}
        };
        await userService.updateData(updateUserOption);
        return response.sendResponse(res, response.build('SUCCESS', {result: {message: 'User logged out successfully'}}));
    }
    catch(error){
        writeLogErrorTrace(['[users logout]', '[controller] Error: ', error]);
        return response.sendResponse(res,response.build("ERROR_SERVER_ERROR",{error: error}));
    }
}


/* ********************************************************************************
* Function Name   : addServicesbyIndividual
* For             : APP and Web
* Purposes        : This function is used to add workers
* Creation Date   : 21-07-2023
* Created By      : Afsar Ali 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.addServicesbyIndividual = async function (req, res) {
  try {
    let mongoose = require('mongoose');
    const userId = req.user.userId;
    const { services, sub_services, price, category} = req.body;
    if (!services) {
      return response.sendResponse(res, response.build('SERVICES_EMPTY', {}));
    } else if (!sub_services){
      return response.sendResponse(res, response.build('SUBSERVICEID_EMPTY', {}));
    } else if(!price){
      return response.sendResponse(res, response.build('PRICE_EMPTY', {}));
    // } else if(!category){
    //   return response.sendResponse(res, response.build('GENDER_EMPTY', {}));
    }else{
      let userData = await providerService.getUserById(userId);
      console.log('userData',userData);
      if(userData && userData.userType === USERTYPE.INDIVIDUAL) {
        let where = {
          condition: { individual: userData._id, user_type: USERTYPE.INDIVIDUAL, serviceData: services }
        };
        let serviceList = await providerService.getServicesFromProvider(where, 'count');
        if (serviceList == 0) { //Add New
          const seq_id = await Counter.getSequence('dqw_provider_services');
          const addDataService = {
            individual    : userData._id,
            user_type     : USERTYPE.INDIVIDUAL,
            seq_id        : seq_id,
            serviceData   : mongoose.Types.ObjectId(services),
            ...(category?{category : category}:null),
            creationDate  : new Date()
          };

          await providerService.addServices(addDataService);
          const sub_seq_id = await Counter.getSequence('dqw_provider_sub_services');
          const addSubService = {
            individual: userData._id,
            user_type: USERTYPE.INDIVIDUAL,
            seq_id: sub_seq_id,
            serviceData: mongoose.Types.ObjectId(services),
            subServices : mongoose.Types.ObjectId(sub_services),
            price: price, 
            ...(category?{category : category}:null),
            creationDate : new Date()
          }

          let data = await providerService.addSubservices(addSubService);
          return response.sendResponse(res, response.build('SUCCESS', { result: data }));
        }else{
          let subServiceCOndition = {
            condition: { individual: userData._id, user_type: USERTYPE.INDIVIDUAL, serviceData: services, subServices : sub_services}
          }

          let isSubServiesAvilable = await providerService.findOneSubservices(subServiceCOndition)

          if(!isSubServiesAvilable){ //Add New Subservices
            const sub_seq_id = await Counter.getSequence('dqw_provider_sub_services');
            const addSubService = {
              individual: userData._id,
              user_type: USERTYPE.INDIVIDUAL,
              seq_id: sub_seq_id,
              serviceData: mongoose.Types.ObjectId(services),
              subServices : mongoose.Types.ObjectId(sub_services),
              price: price, 
              ...(category?{category : category}:null),
              creationDate : new Date()
            }

            let data = await providerService.addSubservices(addSubService);
            return response.sendResponse(res, response.build('SUCCESS', { result: data }));
          } else{ //Update subservice
            const updateParam = {
              price: price, 
              ...(category?{category : category}:null),
            }
            const updateSubService = {
              condition: { individual: userData._id, user_type: USERTYPE.INDIVIDUAL, serviceData: services, subServices : sub_services},
              data : updateParam
            }
            const updatedData = await providerService.updateSubSrvices(updateSubService);
            return response.sendResponse(res, response.build('SUCCESS', { result: updatedData }));
          }
        }
      }else {
        return response.sendResponse(res, response.build('INVALID_USER_TYPE', {}));
      }
    }
  } catch (error) {
    writeLogErrorTrace(['[workers registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
} //END OF FUNCTION

/* ********************************************************************************
* Function Name   : addServicesbyIndividual
* For             : APP and Web
* Purposes        : This function is used to add workers
* Creation Date   : 21-07-2023
* Created By      : Afsar Ali 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.getIndividualServices = async function (req, res) {
  try {
    const userId = req.user.userId;
    let userData = await providerService.getUserById(userId);
    if(userData && userData.userType === USERTYPE.INDIVIDUAL) {
      let where = {
        condition: { individual: userData._id, user_type: USERTYPE.INDIVIDUAL}
      };
      let serviceList = await providerService.getIndividualServicesList(where);
      return response.sendResponse(res, response.build('SUCCESS', { result: serviceList }));
    }else {
      return response.sendResponse(res, response.build('INVALID_USER_TYPE', {}));
    }
  } catch (error) {
    writeLogErrorTrace(['[Individual]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
} //END OF FUNCTION
/* ********************************************************************************
* Function Name   : getIndividualServicesDetailsByID
* For             : APP and Web
* Purposes        : This function is used to add workers
* Creation Date   : 21-07-2023
* Created By      : Afsar Ali 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.getIndividualServicesDetailsByID = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { id }=req.body;
    console.log(id);
    let userData = await providerService.getUserById(userId);
    if(userData && userData.userType === USERTYPE.INDIVIDUAL) {
      let where = {
        condition: { _id: id}
      };
      let serviceList = await providerService.getOnlyOneIndividualServices(where);
      return response.sendResponse(res, response.build('SUCCESS', { result: serviceList }));
    }else {
      return response.sendResponse(res, response.build('INVALID_USER_TYPE', {}));
    }
  } catch (error) {
    writeLogErrorTrace(['[Individual]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
} //END OF FUNCTION
/* ********************************************************************************
* Function Name   : deteleIndividualServicesByID
* For             : APP and Web
* Purposes        : This function is used to add workers
* Creation Date   : 21-07-2023
* Created By      : Afsar Ali 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.deteleIndividualServicesByID = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { id }=req.body
    let userData = await providerService.getUserById(userId);
    if(userData && userData.userType === USERTYPE.INDIVIDUAL) {
      let where = {
        condition: { _id: id}
      };
      await providerService.deleteIndividualServices(where);
      return response.sendResponse(res, response.build('SUCCESS', { result: {'message': "Service Delete Successfully."} }));
    }else {
      return response.sendResponse(res, response.build('INVALID_USER_TYPE', {}));
    }
  } catch (error) {
    writeLogErrorTrace(['[Individual]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
} //END OF FUNCTION
