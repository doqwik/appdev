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
const deleteRecordLog = require("../../../../../services/front/removeRecords");
const sha256 = require('sha256')
const moment = require("moment");
const _ = require("lodash");
const {
  userAuthIssuerName,
  roles: { USER },
  authTokenUserAuthExpiresIn,
  userForgotPasswordPostFix,
  USERTYPE
} = require("../../../../../../config/constant");

const emailService = require("../../../../../services/front/emailService");

const path = require('path');
const fs = require('fs').promises;


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
    const{ mobile, userType }= req.body;
    if(!mobile){
      return response.sendResponse(res, response.build('PHONE_EMPTY', {}));
    }else{
      //Check user when Worker
      if(userType && userType === 'Worker'){
        const gerProviderWhere = {
          condition : { phone : mobile }
        }
        const providerData = await providerService.getData(gerProviderWhere);
        if(providerData && providerData.length > 0 && providerData[0].userType !== 'Worker'){
          return response.sendResponse(res, response.build('ERROR_INVALID_MOBILENUMBER', {}));
        }
      }
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
      const{mobile,otp,device_id}= req.body; 
      // console.log('device_id',device_id)
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
            condition: {"phone": parseInt(mobile)},
            ...(device_id?{ device_id : device_id }:null) 
          }
          // console.log(device_id);
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
      const { fullName, email, phone, country, state, city, address1, address2, land_mark, postal_code, userType, companyRegNo, tinNumber, bankAcountNumber, latitude, longitude, device_id, platform, companyName, documentType, documentNo, ownerBVN, companyPhone, gender } = req.body;
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
      }else if(!userType){
        return response.sendResponse(res, response.build('USERTYPE_EMPTY', {})); 
      }else if(userType === "Company" && !companyName){
        return response.sendResponse(res, response.build('COMPANYNAME_EMPTY', {})); 
      }else if(userType === "Company" && !companyPhone){
        return response.sendResponse(res, response.build('COMPANYPHONE_EMPTY', {}));  
      }else if(userType === 'Company' && !documentType){
        return response.sendResponse(res, response.build('DOCUMENTTYPE_EMPTY', {}));  
      }else if(userType == 'Company' && !documentNo){
        return response.sendResponse(res, response.build('DOCUMENTNO_EMPTY', {}));
      }else if(userType === 'Company' && !ownerBVN){
        return response.sendResponse(res, response.build('BVN_EMPTY', {}));  
      }else if(!gender){
        return response.sendResponse(res, response.build('GENDER_EMPTY', {}));  
      }else{
        const where = { condition : { "phone" : phone } }
        const isUserAvailable = await providerService.getData(where,'count');
        if(isUserAvailable == 0){
          const seq_id = await Counter.getSequence('dqw_providers');
          const addData = {
            seq_id : seq_id,
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
            companyName : companyName,
            companyPhone : companyPhone,
            companyRegNo : companyRegNo,
            tinNumber : tinNumber,
            bankAcountNumber : bankAcountNumber,
            profileComplete : 70,
            ...(req.files.profile_pic[0].path ? {profile_pic: req.files.profile_pic[0].path} : null),
            ...(req.files.certificate[0].path ? {certificate: req.files.certificate[0].path} : null),
            creationDate: new Date(),
            documentType : documentType,
            documentNo : documentNo,
            ownerBVN : ownerBVN,   
            isVerified : 1,
            status: "A",
            ...(latitude? {latitude : latitude}: null),
            ...(longitude? {longitude : longitude}: null),
            ...(device_id? {device_id : device_id}: null),
            ...(platform ? {platform : platform }: null)
          };
          const data = await providerService.createData(addData);
          const mailCOntent = {
            fullName  : data.fullName,
            email     : data.email,
            phone     : data.phone,
            userType  : data.userType
          }
          emailService.sendNewUserRegistrationMailToUser(mailCOntent);
          emailService.sendNewUserRegistrationMailToAdmin(mailCOntent);
          return response.sendResponse(res, response.build('SUCCESS', { result: data }));
        }else{
          return response.sendResponse(res, response.build('SUCCESS', { result: {'status': 400, 'message' : phone+" is already register with another users."} }));
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
              
              ...(req.files ? {profile_pic: req.files.profile_pic[0].path} : null),
              ...(req.files ? {certificate: req.files.certificate[0].path} : null),

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
* Function Name   : addWorker
* For             : APP and Web
* Purposes        : This function is used to add workers
* Creation Date   : 07-06-2023
* Created By      : Afsar Ali 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.addWorker = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { fullName, email, phone,profile_pic, country, state, city, address1, address2, land_mark, postal_code, identificationType, identificationNumber, platform } = req.body;
    if(!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    } else if(!fullName){
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
    }else if(!identificationType){
      return response.sendResponse(res, response.build('IDENTIFICATIONTYPE_EMPTY', {}));
    }else if(!identificationNumber){
      return response.sendResponse(res, response.build('IDENTIFICATIONNUMBER_EMPTY', {}));
    }else if(!platform){
      return response.sendResponse(res, response.build('PLATFORM_EMPTY', {}));
    } else if (!req.files || !req.files.profile_pic || req.files.profile_pic.length === 0) {
      return response.sendResponse(res, response.build('PROFILE_PIC_EMPTY', {}));
    }else{
      // Check Company user
      let companyData = await providerService.getUserById(userId);
      if(!companyData._id){
        return response.sendResponse(res, response.build('COMPANYNOT_FOUND', {}));
      } 
      const where = { condition : { "phone" : phone } }
      const isUserAvailable = await providerService.getData(where,'count');
      if(isUserAvailable == 0){
        let seq_id = await Counter.getSequence('dqw_providers');
        const addData = {
          seq_id : seq_id,
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
          userType : "Worker",
          identificationType : identificationType,
          identificationNumber : identificationNumber,
          platform : platform,
          ...(req.files.profile_pic ? {profile_pic: req.files.profile_pic[0].path} : null),
          creationDate: new Date(),
          isVerified : 1,
          status: "A",
          ...(platform ? {platform : platform }: null),
          companyData : companyData._id
        };
        const workerData = await providerService.createDataWithoutToken(addData);
        if (workerData) {
          //Add worker id to Company data
          const workerId = workerData._id;
          const companyId = companyData._id;
          let workerArr = companyData.workers || [];
          workerArr.push(workerId);
          const updateCompanyOption = {
            condition: { _id: companyId },
            data: { workers: workerArr }
          };
          await providerService.updateData(updateCompanyOption);
          //End
          return response.sendResponse(res, response.build('SUCCESS', { result: workerData }));
        } else {
          return response.sendResponse(res, response.build('SUCCESS', { result: {} }));
        }
      }else{
        return response.sendResponse(res, response.build('SUCCESS', { result: {'message' : phone+" is already register with another users."} }));
      }
    }
  } catch (error) {
    writeLogErrorTrace(['[workers registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
} //END OF FUNCTION
/* ********************************************************************************
* Function Name   : addeditServices
* For             : APP and Web
* Purposes        : This function is used to add workers
* Creation Date   : 07-06-2023
* Created By      : Afsar Ali 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.addeditServices = async function (req, res) {
  try {
    let mongoose = require('mongoose');
    const userId = req.user.userId;
    const { services, sub_services, workerId, price, user_type ,individual,category} = req.body;

    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    } else if (!services) {
      return response.sendResponse(res, response.build('SERVICES_EMPTY', {}));
    } else if (!user_type) {
      return response.sendResponse(res, response.build('USER_TYPE_EMPTY', {}));
    }else if (!price) {
      return response.sendResponse(res, response.build('PRICE_EMPTY', {}));
    }  else {
      if (user_type === USERTYPE.WORKER) {
        let companyData = await providerService.getUserById(userId);
        if (!companyData) {
          return response.sendResponse(res, response.build('USER_NOT_FOUND', {}));
        } else if (!workerId) {
          return response.sendResponse(res, response.build('WORKER_ID_EMPTY', {}));
        }
        
        const isUserAvailable = await providerService.getUserById(workerId);
        if (isUserAvailable) {
          let where1 = {
            condition: { worker: workerId,company: companyData._id, user_type: USERTYPE.WORKER }
          };
          let serviceList = await providerService.getServicesFromProvider(where1, 'count');
          // Add if service count is zero
          const seq_id = await Counter.getSequence('dqw_provider_services');
          if (serviceList === 0) {
            const addData = {
              company: companyData._id,
              user_type: USERTYPE.WORKER,
              seq_id: seq_id,
              worker: workerId,
              services: services,
              subServices: []
            };
            
            for (const serviceId of services) {
              const subServiceCon = { condition: { _id: serviceId }};
              const selected_services = await providerService.getServiceDataById(subServiceCon);
              addData.subServices.push(...selected_services.sub_services);
            }
            
            let updatedData = await providerService.addServicesToProvider(addData);
            return response.sendResponse(res, response.build('SUCCESS', { result: updatedData }));
          } else {
            let serviceData = await providerService.getSingleServicesToProvider(where1);
            let sub_servicesData = [];
            if (serviceData.subServices) {
              sub_servicesData = serviceData.subServices;
            }
            let sub_servicesData1 = [];
            if (serviceData.services) {
              sub_servicesData1 = serviceData.services;
            }
            const mergedArray = [...sub_servicesData];
            const newSubId = [];
            for (const subServiceId of mergedArray) {
              if (mongoose.Types.ObjectId.isValid(subServiceId)) {
                newSubId.push(mongoose.Types.ObjectId(subServiceId));
              } else {
                // console.error(`Invalid ObjectId value: ${subServiceId}`);
              }
            }
            
            // Remove duplicate ObjectId values
            const uniqueNewSubId = newSubId.filter((value, index, self) => {
              return self.findIndex(objId => objId.equals(value)) === index;
            });
            const updateCompanyOption = {
              condition: { _id: serviceData._id },
              data: { subServices: [], services: services }
            };
            for (const serviceId of services) {
              const subServiceCon = { condition: { _id: serviceId }};
              const selected_services = await providerService.getServiceDataById(subServiceCon);
              updateCompanyOption.data.subServices.push(...selected_services.sub_services);
            }
            let insertData = await providerService.updateProviderServocesData(updateCompanyOption);
            return response.sendResponse(res, response.build('SUCCESS', { result: insertData }));
          }
        } else {
          return response.sendResponse(res, response.build('WORKER_NOT_FOUND', {}));
        }
      }else if (user_type === USERTYPE.COMPANY) {
        let companyData = await providerService.getUserById(userId);
        
          let where1 = {
            condition: { company: companyData._id, user_type: USERTYPE.COMPANY }
          };
          let serviceList = await providerService.getServicesFromProvider(where1, 'count');
          // Add if service count is zero
          const seq_id = await Counter.getSequence('dqw_provider_services');
          if (serviceList === 0) {
            const addData = {
              company: companyData._id,
              user_type: USERTYPE.COMPANY,
              seq_id: seq_id,
              services: services,
              price: price,
              subServices: []
            };
            for (const serviceId of services) {
              const subServiceCon = { condition: { _id: serviceId }};
              const selected_services = await providerService.getServiceDataById(subServiceCon);
              addData.subServices.push(...selected_services.sub_services);
            }
            let updatedData = await providerService.addServicesToProvider(addData);
            return response.sendResponse(res, response.build('SUCCESS', { result: updatedData }));
          } else {
            let serviceData = await providerService.getSingleServicesToProvider(where1);
            let sub_servicesData = [];
            if (serviceData.subServices) {
              sub_servicesData = serviceData.subServices;
            }
            let sub_servicesData1 = [];
            if (serviceData.services) {
              sub_servicesData1 = serviceData.services;
            }
            const mergedArray = [...sub_servicesData];
            const newSubId = [];
            for (const subServiceId of mergedArray) {
              if (mongoose.Types.ObjectId.isValid(subServiceId)) {
                newSubId.push(mongoose.Types.ObjectId(subServiceId));
              } else {
                // console.error(`Invalid ObjectId value: ${subServiceId}`);
              }
            }
            
            // Remove duplicate ObjectId values
            const uniqueNewSubId = newSubId.filter((value, index, self) => {
              return self.findIndex(objId => objId.equals(value)) === index;
            });
            const updateCompanyOption = {
              condition: { _id: serviceData._id },
              data: { subServices: [], services: services }
            };
            for (const serviceId of services) {
              const subServiceCon = { condition: { _id: serviceId }};
              const selected_services = await providerService.getServiceDataById(subServiceCon);
              updateCompanyOption.data.subServices.push(...selected_services.sub_services);
            }
            // console.log('update', updateCompanyOption);
            let insertData = await providerService.updateProviderServocesData(updateCompanyOption);
            return response.sendResponse(res, response.build('SUCCESS', { result: insertData }));
          }
      }else if (user_type === USERTYPE.INDIVIDUAL) {
        let companyData = await providerService.getUserById(userId);
        let where1 = {
          condition: { individual: companyData._id, user_type: USERTYPE.INDIVIDUAL }
        };
        let serviceList = await providerService.getServicesFromProvider(where1, 'count');
        const seq_id = await Counter.getSequence('dqw_provider_services');
        if (!category) {
          return response.sendResponse(res, response.build('CATEGORY_EMPTY', {}));
        }
        
        if (serviceList == 0) {
          const addData = {
            individual: companyData._id,
            user_type: USERTYPE.INDIVIDUAL,
            seq_id: seq_id,
            services: [mongoose.Types.ObjectId(services)],
            price: price,
            category: category,
            subServices: sub_services
          };
         let updatedData = await providerService.addServicesToProvider(addData);
          return response.sendResponse(res, response.build('SUCCESS', { result: updatedData }));
        }else{
          let updatedData ="error";
          return response.sendResponse(res, response.build('SUCCESS', { result: updatedData }));
        }
      }else {
        return response.sendResponse(res, response.build('INVALID_USER_TYPE', {}));
      }
    }
  } catch (error) {
    writeLogErrorTrace(['[workers registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
}; //END OF FUNCTION

/* ********************************************************************************
* Function Name   : addServicesbyIndividual
* For             : APP and Web
* Purposes        : This function is used to add workers
* Creation Date   : 20-07-2023
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
    } else if(!category){
      return response.sendResponse(res, response.build('GENDER_EMPTY', {}));
    }else{
      let userData = await providerService.getUserById(userId);
      if(userData && userData.userType === USERTYPE.INDIVIDUAL) {
        let where1 = {
          condition: { individual: userData._id, user_type: USERTYPE.INDIVIDUAL }
        };
        let serviceList = await providerService.getServicesFromProvider(where1, 'count');
        const seq_id = await Counter.getSequence('dqw_provider_services');
        if (!category) {
          return response.sendResponse(res, response.build('CATEGORY_EMPTY', {}));
        }
        if (serviceList == 0) {
          const addData = {
            individual: userData._id,
            user_type: USERTYPE.INDIVIDUAL,
            seq_id: seq_id,
            serviceData: mongoose.Types.ObjectId(services),
            subServicesList : [{ 
                                _id : sub_services, 
                                price: price, 
                                category: category
                              }], 
          };
          let updatedData = await providerService.addServicesToProvider(addData);
          return response.sendResponse(res, response.build('SUCCESS', { result: updatedData }));
        }else{
          // let updatedData ="error";
          const addData = {
            individual: userData._id,
            user_type: USERTYPE.INDIVIDUAL,
            seq_id: seq_id,
            serviceData: mongoose.Types.ObjectId(services),
            subServicesList : [{ 
                                _id : sub_services, 
                                price: price, 
                                category: category
                              }], 
          };
          return response.sendResponse(res, response.build('SUCCESS', { result: addData }));
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
* Function Name   : addWorkImage
* For             : APP and Web
* Purposes        : This function is used to add workers
* Creation Date   : 07-06-2023
* Created By      : Afsar Ali 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.addWorkImage = async function (req, res) {
  try {
    const { workerId }=req.body;
    if (!workerId) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }else{
      const isUserAvailable = await providerService.getUserById(workerId);
      
      return response.sendResponse(res, response.build('SUCCESS', { result: {'message' : "Worker not found."} }));
    }
  } catch (error) {
    writeLogErrorTrace(['[workers registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
} //END OF FUNCTION
/* ********************************************************************************
* Function Name   : addWorker
* For             : APP and Web
* Purposes        : This function is used to add workers
* Creation Date   : 07-06-2023
* Created By      : Afsar Ali 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.editWorker = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { workerId, fullName, country,profile_pic, state, city, address1, address2, land_mark, postal_code, platform } = req.body;
    if(!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    } else if(!fullName){
      return response.sendResponse(res, response.build('FULLNAME_EMPTY', {}));
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
    }else if(!workerId){
      return response.sendResponse(res, response.build('WORKERID_EMPTY', {}));
    }else if(!platform){
      return response.sendResponse(res, response.build('PLATFORM_EMPTY', {}));
    }else if (!req.files || !req.files.profile_pic || req.files.profile_pic.length === 0) {
      return response.sendResponse(res, response.build('PROFILE_PIC_EMPTY', {}));
    }else{
      // Check Company user
      let companyData = await providerService.getUserById(userId);
      companyData.token = '';
      if(!companyData._id){
        return response.sendResponse(res, response.build('COMPANYNOT_FOUND', {}));
      } 
      const where = { 
        condition : { 
          userType    : "Worker", 
          _id         :  workerId,
          companyData : companyData._id
        } 
      }
      const isUserAvailable = await providerService.getData(where,'count');
      
      if(isUserAvailable > 0){
        const updateData = {
          fullName : fullName,
          country: country,
          state: state,
          city: city,
          address1: address1,
          address2: address2,
          land_mark: land_mark,
          postal_code: postal_code,
          ...(req.files.profile_pic ? {profile_pic: req.files.profile_pic[0].path} : null),
          updateDate: new Date(),
          ...(platform ? {platform : platform }: null),
        };

        const updateWorkerOption = {
          condition: { _id: workerId },
          data: updateData
        };
        let workerData = [];  
       
        const data = await providerService.updateData(updateWorkerOption);
        workerData = await providerService.getUserById(data._id);
        return response.sendResponse(res, response.build('SUCCESS', { result: workerData }));
       
      }else{
        return response.sendResponse(res, response.build('SUCCESS', { result: {'message' : phone+" is already register with another users."} }));
      }
    }
  } catch (error) {
    writeLogErrorTrace(['[workers registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
} //END OF FUNCTION

/* ********************************************************************************
* Function Name   : delateWorker
* For             : APP and Web
* Purposes        : This function is used to detele workers
* Creation Date   : 07-08-2023
* Created By      : Afsar Ali 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.delateWorker = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { workerId, platform, ipAddress, latitude, longitude } = req.body;
    if(!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }else if(!workerId){
      return response.sendResponse(res, response.build('WORKERID_EMPTY', {}));
    }else if(!platform){
      return response.sendResponse(res, response.build('PLATFORM_EMPTY', {}));
    }else if (!ipAddress) {
      return response.sendResponse(res, response.build('IPADDRESS_EMPTY', {}));
    }else{
      const where = { 
        condition : { 
          userType    : "Worker", 
          _id         :  workerId,
          companyData : userId
        } 
      }
      const workerData = await providerService.getData(where);
      
      if(workerData && workerData.length  > 0){
        const seq_id = await Counter.getSequence('dqw_provider_services');
        const param ={
          seq_id        : seq_id,
          table         : "dqw_providers",
          params        : JSON.stringify(workerData[0]),
          creationDate  : new Date(),
          creationBy    : userId,
          ...(ipAddress ? { ipAddress : ipAddress } : null),
          ...(latitude ? { latitude : latitude }:null),
          ...(longitude ? { longitude : longitude }:null)

        }
        await deleteRecordLog.createData(param)
        .then( async data =>{
          const deleteWhere = {
            condition : { _id : workerId }
          }
          await providerService.deleteData(deleteWhere);
          const updateWorkerList = {
            condition : { _id : userId },
            pull : { $pull : { workers : workerId } },
          } 
          await providerService.updateWorkerList(updateWorkerList);
          return response.sendResponse(res, response.build('SUCCESS', { result: {"message" : "Worker account terminated successfully."} }));
        })    
      }else{
        return response.sendResponse(res, response.build('SUCCESS', { result: {'message' : " Worker not found."} }));
      }
    }
  } catch (error) {
    writeLogErrorTrace(['[workers delete]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
} //END OF FUNCTION

/* ********************************************************************************
* Function Name   : worker_service_list by company
* For             : APP and Web
* Purposes        : This function is used to show  workers detail for service
* Creation Date   : 24-06-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 

exports.worker_service_list = async function (req, res) {
  try {
    const { services } = req.body;
    const userId = req.user.userId;

    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }
    const where = { condition: { "_id": userId } };
    const providerData = await providerService.getDataById(where);
    
    if (!providerData) {
      return response.sendResponse(res, response.build('ERROR_USER_NOT_FOUND', {}));
    }
  
    const options = { condition: { "services": services,  "provider": providerData.workers } };
    const workerServiceData = await providerService.getworkerdetailData(options);

    const where2 = { condition: { "_id": workerServiceData.services } };
    const serviceData = await providerService.getServiceDataById(where2);
    
    const mergedData = {
      workerServiceData: workerServiceData,
      serviceData: serviceData,
      providerData: providerData
    };

    return response.sendResponse(res, response.build('SUCCESS', { result: mergedData }));
  } catch (error) {
    writeLogErrorTrace(['[workers registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};

/* ********************************************************************************
* Function Name   : worker_service_gallary
* For             : APP and Web
* Purposes        : This function is used to add work Gallary
* Creation Date   : 26-06-2023
* Created By      : Megha Kumari 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
/*exports.worker_service_gallary = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { services, before_work_pic, after_work_pic,worker_id} = req.body;

    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    } else if (!services) {
      return response.sendResponse(res, response.build('SERVICES_EMPTY', {}));
    } else if (!req.files || !req.files.before_work_pic || req.files.before_work_pic.length === 0) {
      return response.sendResponse(res, response.build('BEFORE_WORK_PIC_EMPTY', {}));
    } else if (!req.files || !req.files.after_work_pic || req.files.after_work_pic.length === 0) {
      return response.sendResponse(res, response.build('AFTER_WORK_PIC_EMPTY', {}));
    } else {
      const where = { condition: { "_id": userId } };
      const providerData = await providerService.getDataById(where);

      if (!providerData) {
        return response.sendResponse(res, response.build('ERROR_USER_NOT_FOUND', {}));
      }

      

      const addData = {
        worker_id: worker_id,
        company_id: providerData._id,
        services: services,
        ...(req.files.before_work_pic ? {before_work_pic: req.files.before_work_pic[0].path} : null),
        ...(req.files.after_work_pic ? {after_work_pic: req.files.after_work_pic[0].path} : null),
        creationDate: new Date(),
        isVerified: 1,
        status: "A",
      };
    const where2 = { condition: { "provider": worker_id, "services": services } };
const workerData = await providerService.getworkerdetailData(where2);

if (workerData.length === 0) {
  return response.sendResponse(res, response.build('ERROR_INVALID_WORKER_ID', {}));
}

      const data = await providerService.createWorkGallayData(addData);

      return response.sendResponse(res, response.build('SUCCESS', { result: data._doc }));
    }
  } catch (error) {
    writeLogErrorTrace(['[workers registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};*/
exports.worker_service_gallary = async function (req, res) {
  try {
    const userId = req.user.userId;
    const user_type = req.user.userType;
    const { worker_id, service_id } = req.body;

    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    } else if (!worker_id || !isValidObjectId(worker_id)) {
      return response.sendResponse(res, response.build('WORKERID_EMPTY', {}));
    } else if (!req.files || (!req.files.before_work_pic && !req.files.after_work_pic)) {
      return response.sendResponse(res, response.build('BEFORE_WORK_PIC_EMPTY', {}));
    } else {
      const addData = {
        user_id : worker_id,
        c_id : userId,
        user_type : user_type,
        ...(service_id?{service_id : service_id}:null),
        creationDate: new Date(),
        status: "A",
      };
      if (req.files.before_work_pic && req.files.before_work_pic.length > 0) {
        addData.before_work_pic = req.files.before_work_pic.map((file) => file.path);
      }
      if (req.files.after_work_pic && req.files.after_work_pic.length > 0) {
        addData.after_work_pic = req.files.after_work_pic.map((file) => file.path);
      }
      const data = await providerService.createWorkGallayData(addData);
      return response.sendResponse(res, response.build('SUCCESS', { result: data._doc }));
    }
  } catch (error) {
    writeLogErrorTrace(['[workers registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};
//END OF FUNCTION

/* ********************************************************************************
* Function Name   : worker_service_detail
* For             : APP and Web
* Purposes        : This function is used to get workers detail
* Creation Date   : 26-06-2023
* Created By      : Megha Kumari 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.worker_service_detail = async function (req, res) {
  try {
    const { services, worker_id,user_type } = req.body;
    const userId = req.user.userId;

    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }else if (!user_type) {
      return response.sendResponse(res, response.build('USER_TYPE_EMPTY', {}));
    }  
    if (user_type === USERTYPE.WORKER) {
        const where = { condition: { "_id": userId, "workers": worker_id  } };
        const isUserAvailable = await providerService.getDataById(where);
        if (!isUserAvailable) {
          return response.sendResponse(res, response.build('ERROR_WORKER_NOT_FOUND', {}));
        }else if (!worker_id) {
          return response.sendResponse(res, response.build('WORKER_ID_EMPTY', {}));
        }  
        const where3 = { condition: { "_id": worker_id } };
        const isUserAvailable2 = await providerService.getDataById(where3);
        const options = {
          condition: {
            services: { $in: services }, // Search for services in the array
            company: userId,
            worker: isUserAvailable2._id,
            user_type: USERTYPE.WORKER
          }
        };
        
        let workerData = await providerService.getworkerdetailData(options);

        if (workerData.length === 0) {
          return response.sendResponse(res, response.build('ERROR_SERVICES_NOT_FOUND', {}));
        }
        const where2 = { condition: { "_id": workerData[0].company } };
        const where4 = { condition: { "services": services, "worker_id": worker_id, "company_id": userId ,"user_type":"worker"} };
        const providerData = await providerService.getWorkerDataById(where2);
        const serviceData = await providerService.getGallaryDataById(where4);
        const servicesdetail = { condition: { "_id": workerData[0].services}};
        const serviceDetailData = await providerService.getServiceDataById1(servicesdetail);
        if (!providerData) {
          return response.sendResponse(res, response.build('ERROR_WORKER_NOT_FOUND', {}));
        }
        if (!serviceData) {
          return response.sendResponse(res, response.build('ERROR_WORK_GALLAY_NOT_FOUND', {}));
        }
        if (!serviceDetailData) {
          return response.sendResponse(res, response.build('ERROR_SERVICE_NOT_FOUND', {}));
        }
        const mergedData = {
          workerList: providerData,
          WorkGallary: serviceData,
          Service: serviceDetailData
        };
        if (Object.keys(mergedData.workerList).length === 0) {
          return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
        } else {
          return response.sendResponse(res, response.build('SUCCESS', { result: mergedData }));
       }
    }else if(user_type === USERTYPE.COMPANY){
      const where = { condition: { "_id": userId  } };
      const isUserAvailable = await providerService.getDataById(where);
      if (!isUserAvailable) {
        return response.sendResponse(res, response.build('ERROR_WORKER_NOT_FOUND', {}));
      }
      const options = {
        condition: {
          services: { $in: services }, // Search for services in the array
          company: userId,
          user_type: USERTYPE.COMPANY
        }
      };
      const type = 'data';
      let workerData = await providerService.getworkerdetailData(options);

      if (workerData.length === 0) {
        return response.sendResponse(res, response.build('ERROR_SERVICES_NOT_FOUND', {}));
      }
      const where2 = { condition: { "_id": userId } };
      const where4 = { condition: { "services": services, "company_id": userId ,"user_type":"company"} };
      
    
      const providerData = await providerService.getWorkerDataById(where2);
    
      const serviceData = await providerService.getGallaryDataById(where4);
      const servicesdetail = { condition: { "_id": workerData[0].services}};
      const serviceDetailData = await providerService.getServiceDataById1(servicesdetail);
      if (!providerData) {
        return response.sendResponse(res, response.build('ERROR_WORKER_NOT_FOUND', {}));
      }
      if (!serviceData) {
        return response.sendResponse(res, response.build('ERROR_WORK_GALLAY_NOT_FOUND', {}));
      }
      if (!serviceDetailData) {
        return response.sendResponse(res, response.build('ERROR_SERVICE_NOT_FOUND', {}));
      }
      const mergedData = {
        CompanyList: providerData,
        WorkGallary: serviceData,
        Service: serviceDetailData
      };
      if (Object.keys(mergedData.CompanyList).length === 0) {
        return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
      } else {
        return response.sendResponse(res, response.build('SUCCESS', { result: mergedData }));
      }
    }else if(user_type === USERTYPE.INDIVIDUAL){
      const where = { condition: { "_id": userId  } };
      const isUserAvailable = await providerService.getDataById(where);
      if (!isUserAvailable) {
        return response.sendResponse(res, response.build('ERROR_WORKER_NOT_FOUND', {}));
      }
      const options = { condition: { services: { $in: services }, worker: userId ,user_type: USERTYPE.INDIVIDUAL} };
      let workerData = await providerService.getworkerdetailData(options);

      if (workerData.length === 0) {
        return response.sendResponse(res, response.build('ERROR_SERVICES_NOT_FOUND', {}));
      }
      const where2 = { condition: { "_id": userId } };
      const where4 = { condition: { "services": services, "worker_id": userId, "user_type":"worker"} };
      
    
      const providerData = await providerService.getWorkerDataById(where2);
      const serviceData = await providerService.getGallaryDataById(where4);
      const servicesdetail = { condition: { "_id": workerData[0].services}};
      const serviceDetailData = await providerService.getServiceDataById1(servicesdetail);
      if (!providerData) {
        return response.sendResponse(res, response.build('ERROR_WORKER_NOT_FOUND', {}));
      }
      if (!serviceData) {
        return response.sendResponse(res, response.build('ERROR_WORK_GALLAY_NOT_FOUND', {}));
      }
      if (!serviceDetailData) {
        return response.sendResponse(res, response.build('ERROR_SERVICE_NOT_FOUND', {}));
      }
      const mergedData = {
        WorkerList: providerData,
        WorkGallary: serviceData,
        Service: serviceDetailData
      };
      if (Object.keys(mergedData.WorkerList).length === 0) {
        return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
      } else {
        return response.sendResponse(res, response.build('SUCCESS', { result: mergedData }));
      }
    }else{
      return response.sendResponse(res, response.build('INVALID_USER_TYPE', {}));
    }
  } catch (error) {
    console.error('[workers registration]', '[controller] Error:', error);
    writeLogErrorTrace(['[workers registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};

/* ********************************************************************************
* Function Name   : company_worker_list
* For             : APP and Web
* Purposes        : This function is used to show all company workers
* Creation Date   : 23-06-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 

exports.company_worker_list = async function (req, res) {
  try {
    const userId = req.user.userId;
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }

    const where = { condition: { "_id": userId } }
    const isUserAvailable = await providerService.getDataById(where);

    const workerIds = isUserAvailable.workers; // Assuming workers is an array of worker IDs

    const where3 = { condition: { "_id": { $in: workerIds } } }
    const workers = await providerService.getDataById1(where3);
    if (workers.length === 0) {
      return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
    } else {
      const mergedData = {
        workerList: workers
      };
      return response.sendResponse(res, response.build('SUCCESS', { result: mergedData }));
    }
  } catch (error) {
    console.error('[workers registration]', '[controller] Error:', error);
    writeLogErrorTrace(['[workers registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};
/* ********************************************************************************
* Function Name   : feedback_list
* For             : APP and Web
* Purposes        : This function is used to show all feedback
* Creation Date   : 04-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 

exports.feedback_list = async function (req, res) {
  try {
    const userId = req.user.userId;
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }
    const where = { condition: { "_id": userId } }
    const isUserAvailable = await providerService.getDataById(where);
        if(isUserAvailable.workers!=""){
          const workerIds = isUserAvailable.workers; // Assuming workers is an array of worker IDs
          const where3 = { condition: { "worker_id": { $in: workerIds } } }
          const workers = await providerService.getfeedbackData(where3);
          if (workers.length > 0) {
            return response.sendResponse(res, response.build('SUCCESS', { result: workers }));
          } else {
            return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
          }
      }else {
        const where3 = { condition: { "worker_id": isUserAvailable._id } }
        const workers = await providerService.getfeedbackData(where3);
      
        if (workers.length > 0) {
          return response.sendResponse(res, response.build('SUCCESS', { result: workers }));
        } else {
          return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
        }
      }
  } catch (error) {
    console.error('[workers registration]', '[controller] Error:', error);
    writeLogErrorTrace(['[workers registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};

/* ********************************************************************************
* Function Name   : reply_feedback
* For             : APP and Web
* Purposes        : This function is used to reply feedback to user
* Creation Date   : 04-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 

exports.reply_feedback = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { reply, reply_star, feedback_id } = req.body;
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    } else if (!feedback_id) {
      return response.sendResponse(res, response.build('FEEDBACK_ID_EMPTY', {}));
    } else if (!reply) {
      return response.sendResponse(res, response.build('REVIEW_EMPTY', {}));
    } else if (!reply_star) {
      return response.sendResponse(res, response.build('STAR_EMPTY', {}));
    } else {
      const where = { condition: { "_id": userId } }
      const isUserAvailable = await providerService.getDataById(where);

      const where2 = { condition: { "worker_id": isUserAvailable._id, "_id": feedback_id } }
      const isUserAvailable2 = await providerService.getFeedbackDataById(where2);
      if (isUserAvailable2) {
        const updateData = {
          reply,
          reply_star
        };
        const where3 = { condition: { "_id": isUserAvailable2[0]._id  } }
           

        const feedbackData = await providerService.updatefeedbackData(where3,updateData);
        return response.sendResponse(res, response.build('SUCCESS', { result: feedbackData }));
      } else {
        return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
      }
    }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};
/* ********************************************************************************
* Function Name   : company_worker_service
* For             : APP and Web
* Purposes        : This function is used to show all worker service
* Creation Date   : 04-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 

exports.company_worker_service = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { worker_id } = req.body;
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    } else if (!worker_id) {
      return response.sendResponse(res, response.build('WORKER_ID_EMPTY', {}));
    } else {
      const where = { condition: { "_id": userId } };
      const isUserAvailable = await providerService.getDataById(where);

      const where3 = { condition: { "company": isUserAvailable._id, "worker": worker_id } };
      const workers = await providerService.getWorkerDataBywoekerId(where3);

      if (workers.length === 0) {
        return response.sendResponse(res, response.build('ERROR_SERVICES_NOT_FOUND', {}));
      }

      const where2 = {};
      if (workers.length > 1) {
        where2.condition = { "_id": { $in: workers.map(worker => worker.services) } };
      } else if (workers.length === 1) {
        where2.condition = { "_id": workers[0].services };
      } else {
        // Handle the case where no workers are present
      }

      let serviceData = null; // Initialize serviceData with null

      for (const serviceId of where2.condition._id) {
        // Search for service data based on the ID
        const service = await providerService.getServiceDataById1({ condition: { _id: serviceId } });

        if (!service) {
          return response.sendResponse(res, response.build('ERROR_USER_NOT_FOUND', {}));
        }

        // Assign the retrieved service data to serviceData
        if (!serviceData) {
          serviceData = [service];
        } else {
          serviceData.push(service);
        }
      }

      if (!serviceData || serviceData.length === 0) {
        return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
      } else {
        const mergedData = {
          serviceList: serviceData
        };
        return response.sendResponse(res, response.build('SUCCESS', { result: mergedData }));
      }
    }
  } catch (error) {
    console.error('[workers registration]', '[controller] Error:', error);
    writeLogErrorTrace(['[workers registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};

/* ********************************************************************************
* Function Name   : order_list
* For             : APP and Web
* Purposes        : This function is used to show user order
* Creation Date   : 06-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.order_list = async function (req, res) {
  try {
    const userId = req.user.userId;
    console.log(userId);
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    } else {
      const where = { condition: { "_id": userId } };
      const isUserAvailable = await providerService.getDataById(where);
      if (isUserAvailable && isUserAvailable.workers !== null && isUserAvailable.workers !== "" && isUserAvailable.userType !== "Worker") {
        const workerIds = isUserAvailable.workers; 
        const where1 = {
          condition: { "worker_id": { $in: workerIds }}
        };
        const orderDetails = await order.getOrderDetailId(where1);
        
        if (orderDetails.length > 0) {
          return response.sendResponse(res, response.build('SUCCESS', { result: orderDetails }));
        } else {
          return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
        }
      } else {
        const where2 = { condition: { "worker_id": isUserAvailable._id } };
        const orderDetails = await order.getOrderDetailId(where2);
        
        if (orderDetails.length > 0) {
          return response.sendResponse(res, response.build('SUCCESS', { result: orderDetails }));
        } else {
          return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
        }
      }
    }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};

 // END OF FUNCTION
/* ********************************************************************************
* Function Name   : worker_detail
* For             : APP and Web
* Purposes        : This function is used to show  workers detail 
* Creation Date   : 10-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.worker_detail = async function (req, res) {
  try {
    const { worker_id } = req.body;
    if (!worker_id) {
      return response.sendResponse(res, response.build('WORKER_ID_EMPTY', {}));
    } 
    let option = {
      condition : { _id : worker_id}
    }
    let workerDetailsData = await providerService.getDataById(option);

    const serviceWhere = {
      condition : { $or : [ { individual : worker_id,  user_type : 'Individual' }, { company : worker_id, user_type : 'Company' } ] },
      select : { 
        individual  : true,
        user_type   : true,
        company     : true,
        serviceData : true,
        status      : true
       },
       sort : { seq_id : -1 }
    }

    let serviceData = await providerService.serviceList(serviceWhere);
     
    const subSrviceWhere = {
      condition : { $or : [ { individual : worker_id,  user_type : 'Individual' }, { company : worker_id, user_type : 'Company' } ] },
      select : { 
        individual  : true,
        user_type   : true,
        company     : true,
        serviceData : true,
        subServices : true,
        price       : true,
        category    : true,
        status      : true
       },
       sort : { seq_id : -1 }
    }

    let subServiceData = await providerService.subServiceList(subSrviceWhere);
  
    const mergedData = {
      workerDetailsData : workerDetailsData,
      workerServiceData : serviceData,
      subServiceData    : subServiceData,
      workerGallayData  : [],
      workerFeedbackData: []
    };

    return response.sendResponse(res, response.build('SUCCESS', { result: mergedData }));
  } catch (error) {
    writeLogErrorTrace(['[workers registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};
/* ********************************************************************************
* Function Name   : company_service
* For             : APP and Web
* Purposes        : This function is used to show services
* Creation Date   : 11-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.company_service = async function (req, res) {
  try {
    const userId = req.user.userId;
    
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    } else {
      const where = { condition: { "_id": userId } };
      const isUserAvailable = await providerService.getDataById(where);
      if (isUserAvailable.workers !== null && isUserAvailable.workers !== "" && isUserAvailable.userType !== "Worker") {
        const workerIds = isUserAvailable.workers; 
        const where1 = { condition: { "company": userId,"user_type":"Company" } };

        const data = await providerService.getworkerdetailData(where1);
        let serviceId = null; // Initialize serviceId with null
        if (data.length > 0) {
          serviceId = data[0].services; // Assuming you want to display the service of the first worker only
        }
        let serviceData = null; // Initialize serviceData with null
        if (serviceId) {
          const where = { condition: { "_id": serviceId } };
          serviceData = await providerService.getServiceDataById1(where);
    
          if (!serviceData) {
            return response.sendResponse(res, response.build('ERROR_SERVICE_NOT_FOUND', {}));
          }
        }
        
        if (serviceData && serviceData.length > 0) {
          return response.sendResponse(res, response.build('SUCCESS', { result: serviceData }));
        } else {
          return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
        }
      } else {
        const where2 = { condition: { "worker": isUserAvailable._id  } };
        const data = await providerService.getworkerdetailData(where2);
        console.log(data[0].services);
        let serviceId = null; // Initialize serviceId with null
        if (data.length > 0) {
          serviceId = data[0].services; // Assuming you want to display the service of the first worker only
        }
        let serviceData = null; // Initialize serviceData with null
        if (serviceId) {
          const where = { condition: { "_id": serviceId } };
          serviceData = await providerService.getServiceDataById1(where);
    
          if (!serviceData) {
            return response.sendResponse(res, response.build('ERROR_SERVICE_NOT_FOUND', {}));
          }
        }
        
        if (serviceData.length > 0) {
          return response.sendResponse(res, response.build('SUCCESS', { result: serviceData }));
        } else {
          return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
        }
      }
    }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};

 // END OF FUNCTION
/* ********************************************************************************
* Function Name   : getServices
* For             : APP and Web
* Purposes        : This function is used to get workers service 
* Creation Date   : 18-07-2023
* Created By      : Megha Kumari 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.getServices = async function (req, res) {
  try {
    let mongoose = require('mongoose');
    const userId = req.user.userId;
    const { services, user_type} = req.body;

    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    } else if (!services) {
      return response.sendResponse(res, response.build('SERVICES_EMPTY', {}));
    } else if (!user_type) {
      return response.sendResponse(res, response.build('USER_TYPE_EMPTY', {}));
    }else {
      if (user_type === USERTYPE.INDIVIDUAL) {
          let companyData = await providerService.getUserById(userId);
          let where1 = {
            condition: { individual: companyData._id,user_type : USERTYPE.INDIVIDUAL,  services: { $in: services }}
          };
         
          let serviceList = await providerService.getServicesFromProvider(where1);
         //console.log(serviceList);
          let where2 = {
            condition: {  _id: { $in: serviceList[0].subServices }}
          };
          let subserviceList = await providerService.getsubServicesFromProvider(where2);
          const mergedData = {
            ServiceData: serviceList,
            SubserviceDetails: subserviceList
          };
            return response.sendResponse(res, response.build('SUCCESS', { result: mergedData }));
        }else {
            return response.sendResponse(res, response.build('INVALID_USER_TYPE', {}));
          }
  }
  } catch (error) {
    writeLogErrorTrace(['[workers registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
}; //END OF FUNCTION

/* ********************************************************************************
* Function Name   : addServicesbyCompany
* For             : APP and Web
* Purposes        : This function is used to add service
* Creation Date   : 21-07-2023
* Created By      : Afsar Ali 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.addServicesbyCompany = async function (req, res) {
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
      if(userData && userData.userType === USERTYPE.COMPANY) {
        let where = {
          condition: { company: userData._id, user_type: USERTYPE.COMPANY, serviceData: services }
        };
        let serviceList = await providerService.getServicesFromProvider(where, 'count');
        if (serviceList == 0) { //Add New
          const seq_id = await Counter.getSequence('dqw_provider_services');
          const addDataService = {
            company    : userData._id,
            user_type     : USERTYPE.COMPANY,
            seq_id        : seq_id,
            serviceData   : mongoose.Types.ObjectId(services),
            ...(category?{category : category}:null),
            creationDate  : new Date()
          };

          await providerService.addServices(addDataService);
          const sub_seq_id = await Counter.getSequence('dqw_provider_sub_services');
          const addSubService = {
            company: userData._id,
            user_type: USERTYPE.COMPANY,
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
            condition: { company: userData._id, user_type: USERTYPE.COMPANY, serviceData: services, subServices : sub_services}
          }

          let isSubServiesAvilable = await providerService.findOneSubservices(subServiceCOndition)

          if(!isSubServiesAvilable){ //Add New Subservices
            const sub_seq_id = await Counter.getSequence('dqw_provider_sub_services');
            const addSubService = {
              company: userData._id,
              user_type: USERTYPE.COMPANY,
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
              condition: { company: userData._id, user_type: USERTYPE.COMPANY, serviceData: services, subServices : sub_services},
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
* Function Name   : getCompanyServicesList
* For             : APP and Web
* Purposes        : This function is used to add workers
* Creation Date   : 21-07-2023
* Created By      : Afsar Ali 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.getCompanyServicesList = async function (req, res) {
  try {
    const userId = req.user.userId;
    let userData = await providerService.getUserById(userId);
    if(userData && userData.userType === USERTYPE.COMPANY) {
      let where = {
        condition: { company: userData._id, user_type: USERTYPE.COMPANY}
      };
      let serviceList = await providerService.getIndividualServicesList(where);
      return response.sendResponse(res, response.build('SUCCESS', { result: serviceList }));
    }else {
      return response.sendResponse(res, response.build('INVALID_USER_TYPE', {}));
    }
  } catch (error) {
    writeLogErrorTrace(['[Company]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
} //END OF FUNCTION

/* ********************************************************************************
* Function Name   : companyServicesList
* For             : APP and Web
* Purposes        : This function is used to get company services
* Creation Date   : 01-08-2023
* Created By      : Afsar Ali 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.companyServicesList = async function (req, res) {
  try {
    const userId = req.user.userId;
    let userData = await providerService.getUserById(userId);
    if(userData && userData.userType === USERTYPE.COMPANY) {
      let where = {
        condition: { company: userData._id, user_type: USERTYPE.COMPANY}
      };
      let serviceList = await providerService.fetchAllIndividualServices(where);
      return response.sendResponse(res, response.build('SUCCESS', { result: serviceList }));
    }else {
      return response.sendResponse(res, response.build('INVALID_USER_TYPE', {}));
    }
  } catch (error) {
    writeLogErrorTrace(['[Company]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
} //END OF FUNCTION


/* ********************************************************************************
* Function Name   : getCompanyServicesDetailsByID
* For             : APP and Web
* Purposes        : This function is used to add workers
* Creation Date   : 21-07-2023
* Created By      : Afsar Ali 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.getCompanyServicesDetailsByID = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { id }=req.body
    let userData = await providerService.getUserById(userId);
    if(userData && userData.userType === USERTYPE.COMPANY) {
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
* Function Name   : deteleCompanyServicesByID
* For             : APP and Web
* Purposes        : This function is used to add workers
* Creation Date   : 21-07-2023
* Created By      : Afsar Ali 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.deteleCompanyServicesByID = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { id }=req.body
    let userData = await providerService.getUserById(userId);
    if(userData && userData.userType === USERTYPE.COMPANY) {
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
/* ********************************************************************************
* Function Name   : addServicesbyCompanyToWorker
* For             : APP and Web
* Purposes        : This function is used to add service
* Creation Date   : 24-07-2023
* Created By      : Afsar Ali 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.addServicesbyCompanyToWorker = async function (req, res) {
  try {
    let mongoose = require('mongoose');
    const userId = req.user.userId;
    const { services, workerData } = req.body;
    const opptServiceID = [];
    if (!services) {
      return response.sendResponse(res, response.build('SERVICES_EMPTY', {}));
    } else if (!workerData) {
      return response.sendResponse(res, response.build('WORKER_ID_EMPTY', {}));
    } else {
      let userData = await providerService.getUserById(userId);
      if (userData && userData.userType === USERTYPE.COMPANY) {
        const promises = services.map(async (item) => {
          let servideDataWhere = {
            _id : item
          }
          let currServiceData = await providerService.findOneSubservices(servideDataWhere);
          const serServiceCondition = { 
            condition: { user_type: USERTYPE.COMPANY, serviceData: currServiceData.serviceData }
          };
          opptServiceID.push(currServiceData.serviceData);
          const getServiceData = providerService.getIndividualServicesList(serServiceCondition);
          const where = {
            condition: { worker: workerData, user_type: USERTYPE.WORKER, serviceData: currServiceData.serviceData }
          };
          const serviceList = providerService.getServicesFromProvider(where, 'count');
          
          const [servicesData, serviceCount] = await Promise.all([getServiceData, serviceList]);
          console.log('servicesData',servicesData);
          if (serviceCount === 0) {
            const seq_id = await Counter.getSequence('dqw_provider_services');
            const addDataService = {
              worker: workerData,
              workerCompany: userId,
              user_type: USERTYPE.WORKER,
              seq_id: seq_id,
              serviceData: mongoose.Types.ObjectId(currServiceData.serviceData),
              creationDate: new Date(),
            };
            await providerService.addServices(addDataService);

            const subServicePromises = servicesData.map(async (value) => {
              const sub_seq_id = await Counter.getSequence('dqw_provider_sub_services');
              const addSubService = {
                worker: workerData,
                workerCompany: userId,
                user_type: USERTYPE.WORKER,
                seq_id: sub_seq_id,
                serviceData: mongoose.Types.ObjectId(currServiceData.serviceData),
                subServices: mongoose.Types.ObjectId(value.subServices._id),
                price: value.price,
                ...(value.category ? { category: value.category } : null),
                creationDate: new Date(),
              };
              await providerService.addSubservices(addSubService);
            });

            await Promise.all(subServicePromises);
          }
        });

        await Promise.all(promises);

        const serviceWhere = {
          condition: {
            "serviceData": { "$in": opptServiceID },
            "worker": workerData,
          },
        };
        const serviceList = await providerService.serviceList(serviceWhere);
        return response.sendResponse(res, response.build('SUCCESS', { result: serviceList }));
      } else {
        return response.sendResponse(res, response.build('INVALID_USER_TYPE', {}));
      }
    }
  } catch (error) {
    writeLogErrorTrace(['[workers ADD SERVICE]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
}



//END OF FUNCTION

/* ********************************************************************************
* Function Name   : getServiceWorkerList
* For             : APP and Web
* Purposes        : This function is used to get workers list by service 
* Creation Date   : 02-08-2023
* Created By      : Afsar Ali 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.getServiceWorkerList = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { serviceId }=req.body;
    let idList = []
    const workerIdList = {
      serviceData : serviceId,
      workerCompany : userId
    }

    const workerID = await providerService.serviceList(workerIdList);
    if(!workerID){
      return response.sendResponse(res, response.build('ERROR_INVALID_WORKER_ID', { }));
    }

    const promises = workerID.map((item) => {
      idList.push(item.worker)
    });

    await Promise.all(promises);

    const where ={
      condition : { 
        _id : { "$in": idList },
        workerCompany : userId, 
        user_type : "Worker" 
      },
      select : {
        fullName    : true,
        phone       : true,
        profile_pic : true,
        country     : true,
        state       : true,
        city        : true,
        land_mark   : true,
        postal_code : true,
        status      : true

      }
    }

    let workerList = await providerService.getData(where);

    return response.sendResponse(res, response.build('SUCCESS', { result: workerList }));
  } catch (error) {
    writeLogErrorTrace(['[Provider]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
} //END OF FUNCTION

/* ********************************************************************************
* Function Name   : worker_service_list_by_ID by company
* For             : APP and Web
* Purposes        : This function is used to show  workers detail for service
* Creation Date   : 24-06-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 

exports.worker_service_list_by_ID = async function (req, res) {
  try {
    const userId = req.user.userId;

    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }
    
    const where2 = { condition: { "worker": userId } };
    const serviceData = await providerService.serviceList(where2);
    

    return response.sendResponse(res, response.build('SUCCESS', { result: serviceData }));
  } catch (error) {
    writeLogErrorTrace(['[workers registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};