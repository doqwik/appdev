const userService = require('../../../../../services/front/userService');
const providerService = require('../../../../../services/front/providerService');

const Counter = require('../../../../../services/front/counterService');


const response = require('../../../../../../util/response');
const {writeLogErrorTrace} = require('../../../../../../util/logger');
const {isValidObjectId} = require('../../../../../../util/valueChecker');
const AuthToken = require("../../../../../../util/authToken");
const userCache = require("../../../../../../util/userCache");
const OtpGeneration = require("../../../../../../util/otpGeneration");
const OtpVerification = require("../../../../../../util/otpVerification");
const Util = require('../../../../../../util/utility');
const sha256 = require('sha256')
const moment = require("moment");
const _ = require("lodash");
const emailService = require("../../../../../services/front/emailService");
const AllService = require('../../../../../services/front/services');

const {
    userAuthIssuerName,
    roles: { USER },
    authTokenUserAuthExpiresIn,
    userForgotPasswordPostFix,
    USERTYPE
  } = require("../../../../../../config/constant");

const smsService = require("../../../../../services/front/smsService");

const path = require('path');
const fs = require('fs').promises;


/* ********************************************************************************
* Function Name   : login
* Purposes        : This function is used to generate OTP
* Creation Date   : 30-05-2023
* Created By      : Afsar Ali
* Update By       :
* Update Date     :
************************************************************************************/ 
exports.login = async function (req, res) {
  try {
    const {key} = req.headers;
    const{mobile, country_code}= req.body;
    if(!mobile){
      return response.sendResponse(res, response.build('PHONE_EMPTY', {}));
    }else{
      //check if otp generated within given time
      await OtpGeneration.canOtpGenerated(mobile)
      // generate random 4 digit OTP code
      let code = 123456;
      console.log(req.body);
      if(country_code && country_code === 234){
        let code = OtpGeneration.randomNumeric(6);   
      }
      // const code = 123456;
      // const code = OtpGeneration.randomNumeric(6); 
      console.log('login OTP', code)
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
      await smsService.sentLoginOTP(record);
      
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
      if(!mobile){
        return response.sendResponse(res, response.build('PHONE_EMPTY', {}));
      }else if(!otp){
        return response.sendResponse(res, response.build('OTP_EMPTY', {}));
      }else{
        const data = {
          code: otp,
          phone: mobile
        }
        // console.log(data);
        const isverify = await OtpVerification.isValidUserOtp(data);
        if(isverify == true){
          const getUserOption = {
            condition: {"phone": mobile},
            ...(device_id?{device_id:device_id}:null)
          }
          var userData = await userService.getUserLogin(getUserOption);
          
          if(userData){
            res.setHeader("Authorization",userData.token);
            userData.password  = "";
            //userData.token  = "";
            return response.sendResponse(res, response.build('SUCCESS', {result: userData}));
          }else{
            const userData = {
              "phone": mobile,
              "flag" : "new_user"
            }
            return response.sendResponse(res, response.build('SUCCESS', {result: userData}));
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
* Creation Date   : 26-05-2023
* Created By      : Megha Kumari
* Update By       : Afsar Ali
* Update Date     : 30-05-2023
************************************************************************************/ 
exports.register = async function (req, res) {
  try {
      const { fullName, email, phone, country, state, city, address1, address2, land_mark, postal_code, latitude, longitude, device_id, platform, documentNo, documentType } = req.body;
      if(!fullName){
        return response.sendResponse(res, response.build('FULLNAME_EMPTY', {}));
      }else if(!email){
        return response.sendResponse(res, response.build('EMAIL_EMPTY', {}));
      }else if(!phone){
        return response.sendResponse(res, response.build('PHONE_EMPTY', {}));
      }else if(!country){
        return response.sendResponse(res, response.build('COUNTRY_EMPTY', {}));
      }else if(!state){
        return response.sendResponse(res, response.build('CITY_EMPTY', {}));
      }else if(!land_mark){
        return response.sendResponse(res, response.build('LANDMARK_EMPTY', {}));
      }else if(!postal_code){
        return response.sendResponse(res, response.build('POSTALCODE_EMPTY', {}));
      }else if(!req.files.document){
        return response.sendResponse(res, response.build('DOCUMENT_EMPTY', {}));
      }else{
        const where = { condition : { "phone" : phone } }
        const isUserAvailable = await userService.getData(where,'count');
        if(isUserAvailable == 0){
          const seq_id = await Counter.getSequence('dqw_users');
          const addData = {
            users_id : seq_id,
            fullName: fullName,
            email: email,
            phone: phone,
            country: country,
            state: state,
            city: city,
            address1: address1,
            address2: address2,
            land_mark: land_mark,
            postal_code: postal_code,
            ...(req.files.profile_pic[0].path ? {profile_pic: req.files.profile_pic[0].path} : null),
            ...(req.files.document[0].path ? {document: req.files.document[0].path} : null),
            creationDate: new Date(),
            isVerified : 1,
            status: "A",
            ...(latitude? {latitude : latitude}: null),
            ...(longitude? {longitude : longitude}: null),
            ...(device_id? {device_id : device_id}: null),
            ...(platform ? {platform : platform }: null),
             documentNo:documentNo,
            documentType:documentType
          };
          let insertData 
           await userService.createData(addData).then( rtnData => {
            insertData = rtnData;
           } )
           console.log(insertData._id);
           const generateToken = {
            condition : { _id : insertData._id}
           }
           const data = await userService.getUserLogin(generateToken);
           const mailData ={
            fullName  : data.fullName,
            email     : data.email,
            phone     : data.phone,
            userType  : 'User'
           }
           emailService.sendNewUserRegistrationMailToUser(mailData);
           emailService.sendNewUserRegistrationMailToAdmin(mailData);
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
* Function Name   : edit_user
* For             : APP and Web
* Purposes        : This function is used to edit user
* Creation Date   : 06-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.edit_user = async function (req, res) {
  try {
    const userId = req.user.userId;
      const { fullName, email, phone, country, state, city, address1, address2, land_mark, postal_code, latitude, longitude, device_id, platform } = req.body;
      if(!userId || !isValidObjectId(userId)) {
        return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
      } else if(!fullName){
        return response.sendResponse(res, response.build('FULLNAME_EMPTY', {}));
      }else if(!email){
        return response.sendResponse(res, response.build('EMAIL_EMPTY', {}));
      }else if(!country){
        return response.sendResponse(res, response.build('COUNTRY_EMPTY', {}));
      }else if(!state){
        return response.sendResponse(res, response.build('CITY_EMPTY', {}));
      }else if(!land_mark){
        return response.sendResponse(res, response.build('LANDMARK_EMPTY', {}));
      }else if(!postal_code){
        return response.sendResponse(res, response.build('POSTALCODE_EMPTY', {}));
      }else if (!req.files || !req.files.profile_pic || req.files.profile_pic.length === 0) {
        return response.sendResponse(res, response.build('PROFILE_PIC_EMPTY', {}));
      }else{
        let userData = await userService.getUserById(userId);
        userData.token = '';
      if(!userData._id){
        return response.sendResponse(res, response.build('USERNOT_FOUND', {}));
      } 
      const where = { 
        condition : { 
          _id         : userData._id
        } 
      }
      const isUserAvailable = await userService.getData(where,'count');
      
      if(isUserAvailable > 0){
        const updateData = {
          fullName: fullName,
            email: email,
            country: country,
            state: state,
            city: city,
            address1: address1,
            address2: address2,
            land_mark: land_mark,
            postal_code: postal_code,
            ...(req.files.profile_pic[0].path ? {profile_pic: req.files.profile_pic[0].path} : null),
          updateDate: new Date(),
          ...(platform ? {platform : platform }: null),
        };
        const updateWorkerOption = {
          condition: { _id: userData._id },
          data: updateData
        };
        let workerData = [];  
        const data = await userService.updateData(updateWorkerOption);
        workerData = await userService.getUserById(data._id);
        return response.sendResponse(res, response.build('SUCCESS', { result: workerData }));
       
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
* Function Name   : address
* For             : APP and Web
* Purposes        : This function is used to insert address
* Creation Date   : 21-06-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.address = async function (req, res) {
  try {
    const userId = req.user.userId;
    if(!userId || !isValidObjectId(userId)) {
        return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }  
    const { country, state, city, address1, address2, land_mark, postal_code, latitude, longitude, platform } = req.body;
    if(!country){
      return response.sendResponse(res, response.build('COUNTRY_EMPTY', {}));
    } else if(!state){
      return response.sendResponse(res, response.build('STATE_EMPTY', {}));
    } else if(!city){
      return response.sendResponse(res, response.build('STATE_EMPTY', {}));
    } else if(!land_mark){
      return response.sendResponse(res, response.build('LANDMARK_EMPTY', {}));
    } else if(!postal_code){
      return response.sendResponse(res, response.build('POSTALCODE_EMPTY', {}));
    } else{
      const where = { condition : { "_id" : userId } }
      const userData = await userService.getDataById(where);
      if(!userData){
        return response.sendResponse(res, response.build('USERNOT_FOUND', {}));
      }
      const addData = {
        user_id : userId,
        user_seq_id : userData.users_id,
        country: country,
        state: state,
        city: city,
        address1: address1,
        address2: address2,
        land_mark: land_mark,
        postal_code: postal_code,
        creationDate: new Date(),
        status: "A",
        ...(latitude? {latitude : latitude}: null),
        ...(longitude? {longitude : longitude}: null),
        ...(platform ? {platform : platform }: null)
      };
      await userService.createDataAddress(addData)
      .then(data => {
        Util.addAddressIDtoUserProfile(data._id,userData._id)
        return response.sendResponse(res, response.build('SUCCESS', { result: data }));
      })
    }
  } catch (error) {
      writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
      return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
} //ENF OF FUNCTION

  exports.getuserById = async function (req, res) {
    try {
      const { key } = req.headers;
      const { id } = req.params; // Assuming you want to retrieve data by ID, extract the ID from the request parameters
  
      const options = { condition: { _id: id } }; // Set the condition to retrieve data by the specified ID
      const data = await userService.getDataById(options); // Retrieve data based on the specified options
  
      if (data) {
        return res.status(200).json(data); // Return the retrieved data in the response
      } else {
        return res.status(404).json({ error: 'Data not found' }); // Return a not found error if the data is not found
      }
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' }); // Return an error response in case of an error
    }
  };
  
/* ********************************************************************************
* Function Name   : address_list
* For             : APP and Web
* Purposes        : This function is used to show all address
* Creation Date   : 23-06-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.address_list = async function (req, res) {
  try {
      const userId = req.user.userId;
    if(!userId || !isValidObjectId(userId)) {
        return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }  
   const where = { condition : { "user_id" : userId } }
   const data = await userService.getAddressDataById(where);
    return response.sendResponse(res, response.build('SUCCESS', { result: data }));
  } catch (error) {
      writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
      return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
}


/* ********************************************************************************
* Function Name   : edit_address
* For             : APP and Web
* Purposes        : This function is used to edit address
* Creation Date   : 27-06-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.edit_address = async function (req, res) {
  try {
      const userId = req.user.userId;
      const { address_id } = req.headers;
      const { country, state, city, address1, address2, land_mark, postal_code, latitude, longitude, device_id, platform } = req.body;
    if(!userId || !isValidObjectId(userId)) {
        return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }else if(!address_id){
      return response.sendResponse(res, response.build('ADDRESS_ID_EMPTY', {}));
    }else if(!country){
      return response.sendResponse(res, response.build('COUNTRY_EMPTY', {}));
    }else if(!state){
      return response.sendResponse(res, response.build('CITY_EMPTY', {}));
    }else if(!land_mark){
      return response.sendResponse(res, response.build('LANDMARK_EMPTY', {}));
    }else if(!postal_code){
      return response.sendResponse(res, response.build('POSTALCODE_EMPTY', {}));
    }else{ 
      const where = { condition : { "user_id" : userId ,"_id" :address_id } }
      const data = await userService.getAddressDataById(where);
      if (data) {
        const addData = {
          country: country,
          state: state,
          city: city,
          address1: address1,
          address2: address2,
          land_mark: land_mark,
          postal_code: postal_code,
          creationDate: new Date(),
          status: "A",
          ...(latitude? {latitude : latitude}: null),
          ...(longitude? {longitude : longitude}: null),
          ...(device_id? {device_id : device_id}: null),
          ...(platform ? {platform : platform }: null)
        };

        const address = await userService.updateaddressData(where, addData); // Update the order data with the new information
        return response.sendResponse(res, response.build('SUCCESS', { result: address }));
      } else {
        return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
      }
    }
  } catch (error) {
      writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
      return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
}
/* ********************************************************************************
* Function Name   : user_list
* For             : APP 
* Purposes        : This function is used to show all user
* Creation Date   : 30-06-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 

exports.user_list = async function (req, res) {
  try {
    const { services,limit,skip } = req.body;
    const where = { 
      condition: { serviceData: services, user_type: { $ne: "Worker" } },
      ...(limit?{limit : limit}:null),
      ...(skip?{skip : skip}:null),
      select : {
        company     : true,
        individual  : true,
        user_type   : true,
        serviceData : true,
        category    : true,
      }

     } ;
     let finalProviderList = [];
    // let data = await providerService.getProviderList(where);
    await providerService.getProviderList(where)
    .then(async providerData => {
      await Promise.all(providerData.map(async value =>{
        if(value.user_type === "Individual"){
          let where = {
            condition : { "serviceData" : value.serviceData._id, user_type : "Individual", individual : value.individual._id }
          }
          await providerService.subServiceList(where)
          .then( subService =>{
            if(subService && subService.length > 0){
              const provider = {
                _id : value._id,
                individual : {
                      _id       : value.individual._id,
                      fullName  : value.individual.fullName,
                      email     : value.individual.email,
                      phone     : value.individual.phone,
                      country   : value.individual.country,
                      state     : value.individual.state,
                      city      : value.individual.city,
                      land_mark : value.individual.land_mark,
                      postal_code : value.individual.postal_code,
                      profile_pic   : value.individual.profile_pic,
                      address1   : value.individual.address1,
                      address2   : value.individual.address2,
                      status   : value.individual.status,
                    },
                  user_type : value.user_type,
                  serviceData : {
                    _id         : value.serviceData._id,
                    service_name : value.serviceData.service_name,
                    tags : value.serviceData.tags,
                    status : value.serviceData.status,
                    isCategory : value.serviceData.isCategory
                  },
                  addedSubService:subService
              }
              finalProviderList.push(provider);
            }
          });
        } else if(value.user_type === "Company"){
          let where = {
            condition : { "serviceData" : value.serviceData._id, user_type : "Company", company : value.company._id }
          }
          await providerService.subServiceList(where)
          .then( subService =>{
            if(subService && subService.length > 0){
              const provider = {
                _id : value._id,
                company : {
                      _id       : value.company._id,
                      fullName  : value.company.fullName,
                      email     : value.company.email,
                      phone     : value.company.phone,
                      country   : value.company.country,
                      state     : value.company.state,
                      city      : value.company.city,
                      land_mark : value.company.land_mark,
                      postal_code : value.company.postal_code,
                      profile_pic   : value.company.profile_pic,
                      address1   : value.company.address1,
                      address2   : value.company.address2,
                      status   : value.company.status,
                    },
                  user_type : value.user_type,
                  serviceData : {
                    _id         : value.serviceData._id,
                    service_name : value.serviceData.service_name,
                    tags : value.serviceData.tags,
                    status : value.serviceData.status,
                    isCategory : value.serviceData.isCategory
                  },
                  addedSubService:subService
              }
              finalProviderList.push(provider);
            }
          });
        }
      }));
    });
    return response.sendResponse(res, response.build('SUCCESS', { result: finalProviderList }));
  } catch (error) {
    // console.error('[workers registration]', '[controller] Error:', error);
    writeLogErrorTrace(['[User list bu service]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};

/* ********************************************************************************
* Function Name   : feedback
* For             : APP and Web
* Purposes        : This function is used to give feedback to worker
* Creation Date   : 04-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.feedback = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { worker_id, review, star } = req.body;
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }else if (!worker_id) {
      return response.sendResponse(res, response.build('WORKER_ID_EMPTY', {}));
    }else if (!review) {
      return response.sendResponse(res, response.build('REVIEW_EMPTY', {}));
    }else if (!star) {
      return response.sendResponse(res, response.build('STAR_EMPTY', {}));
    }else {
      const where = { condition: { "_id": userId } }
      const isUserAvailable = await userService.getDataById(where);
         if (isUserAvailable) {
          const addData = {
            user_id: userId,
            user_seq_id: isUserAvailable.users_id,
            worker_id: worker_id,
            review,
            star,
            creationDate: new Date(),
            status: "A",
          };
          const data = await userService.createDataFeedback(addData);
          return response.sendResponse(res, response.build('SUCCESS', { result: data }));
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
* Function Name   : getregister
* For             : APP and Web
* Purposes        : This function is used to give feedback to worker
* Creation Date   : 04-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.getregister = async function (req, res) {
    try {
      const { key } = req.headers;
  
      const options = {}; // Add the desired options for data retrieval, such as condition, sort, skip, limit
      const type = 'data'; // Specify the type as 'data' to retrieve the data
  
      const data = await userService.getData(options, type); // Retrieve data based on the specified options and type
  
      return res.status(200).json(data); // Return the retrieved data in the response
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' }); // Return an error response in case of an error
    }
};
/* ********************************************************************************
* Function Name   : getuserById
* For             : APP and Web
* Purposes        : This function is used to give feedback to worker
* Creation Date   : 04-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.getuserById = async function (req, res) {
  try {
    const { key } = req.headers;
    const { id } = req.params; // Assuming you want to retrieve data by ID, extract the ID from the request parameters

    const options = { condition: { _id: id } }; // Set the condition to retrieve data by the specified ID
    const data = await userService.getDataById(options); // Retrieve data based on the specified options

    if (data) {
      return res.status(200).json(data); // Return the retrieved data in the response
    } else {
      return res.status(404).json({ error: 'Data not found' }); // Return a not found error if the data is not found
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' }); // Return an error response in case of an error
  }
};

/* ********************************************************************************
* Function Name   : getuserupdate
* For             : APP and Web
* Purposes        : This function is used to give feedback to worker
* Creation Date   : 04-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/   
exports.getuserupdate = async function (req, res) {
  const basePath = __basePath;
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      professionId,
      specialtieId,
      acceptTerm,
      currentIp,
      currentDate,
    } = req.body;
    const hashPassword = sha256(password.toString());
    const addData = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashPassword,
      professionId: professionId,
      specialtieId: specialtieId,
      acceptTerm: acceptTerm || "N",
      creationDate: currentDate || new Date(),
      creationIp: currentIp || "127.0.0.1",
      status: "A",
    };

    if (req.file) {
      const fs = require('fs');
      const filePath = basePath + partnerDetails.profile_pic;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const options = {
      condition: { _id: req.params.id }, // Set the condition to update data by the specified ID
      data: addData, // Set the updated data
    };

    const updatedUser = await userService.updateData(options);
    updatedUser.password = "";
    updatedUser.token = "";

    return response.sendResponse(
      res,
      response.build('SUCCESS', { result: updatedUser._doc })
    );
  } catch (error) {
    writeLogErrorTrace(['[users create]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};
/* ********************************************************************************
* Function Name   : userdelete
* For             : APP and Web
* Purposes        : This function is used to give feedback to worker
* Creation Date   : 04-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.userdelete = async function (req, res) {
  try {
    const { key } = req.headers;
    const { id } = req.params;
    const options = {
      condition: { _id: id }, // Set the condition to delete data by the specified ID
    };
    await userService.deleteData(options); // Delete data based on the specified options

    return response.sendResponse(res, response.build('SUCCESS', { message: 'Data deleted successfully' }));
  } catch (error) {
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};
/* ********************************************************************************
* Function Name   : forgotPassword
* For             : APP and Web
* Purposes        : This function is used to give feedback to worker
* Creation Date   : 04-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.forgotPassword = async function (req, res) {
  try {
      const{email}= req.body; 
      const getUserOption = {
          condition: {email: email}
      };
      var userData = await userService.getDataById(getUserOption);
      if(userData){
          // generate forgot token
          let userId   = userData._id;
          const token = await AuthToken.generateToken(
              userId,
              USER,
              userAuthIssuerName,
              authTokenUserAuthExpiresIn
          );
          await userCache.invalidate(userData._id);
          await userCache.setToken(userId, token);
          res.setHeader("Authorization",token);
          userData.password  = "";
          userData.token  = "";
          //check if otp generated within given time
          await OtpGeneration.canUserOtpGenerated(userData.email);
          // generate random 4 digit OTP code
          const code = 1111;//OtpGeneration.randomNumeric(4); 
          //prepare data
          const record = { email:userData.email, code:code }; 
          //save to verifcation table
          await OtpGeneration.saveOtp(record); 
          const payload = {
              _id: userData._id,
              email: userData.email,
              Message: `Your One Time Password is: ${code}`,
          };
          return response.sendResponse(res, response.build('SUCCESS', {result: payload}));
      } else{ 
          return response.sendResponse(res, response.build('ERROR_INVALID_EMAILADDRESS', {}));
      }
  } catch(error) { 
      return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', {error: error}));
  }
}
/* ********************************************************************************
* Function Name   : resetPassword
* For             : APP and Web
* Purposes        : This function is used to give feedback to worker
* Creation Date   : 04-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.resetPassword = async function (req, res){
    try {
        let userId = req.user.userId;
        const { code, password } = req.body;
        if(!userId) {
            return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
        }
        if(!isValidObjectId(userId)) {
            return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
        }
        let userData = await userService.getUserById(userId);
        if(!userData) {
            return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
        }
        const data = {
            code: code,
            email: userData.email
        }
        const result = await OtpVerification.isValidUserOtp(data);
        if(!result){
            return response.sendResponse(res, response.build('ERROR_INVALID_USER_OTP', {}));
        }
        if(password){
            const hashPassword = sha256(password.toString());
            const data = {
                ...{ password: hashPassword }
            };
            const updateUserOption = {
                condition: {_id: userId},
                data: data
            };
            await userService.updateData(updateUserOption);
            await userCache.invalidate(userData._id);
            await userCache.invalidate(req.user.userId);
        }
        return response.sendResponse(res, response.build('SUCCESS', {result: {message: 'Password changed successfully'}}));
    } catch (error) {
        console.log(error);
        writeLogErrorTrace(['[users update]', '[controller] Error: ', error]);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', {error: error}));
    }
}
/* ********************************************************************************
* Function Name   : getProfileData
* For             : APP and Web
* Purposes        : This function is used to give feedback to worker
* Creation Date   : 04-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.getProfileData = async function (req, res) {
    try {
        const userId = req.user.userId;
        if(!userId || !isValidObjectId(userId)) {
            return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
        }
        const userData = await userService.getUserById(userId);
        if(!userData) {
            return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
        }
        userData.password  = "";
        userData.token  = "";
        return response.sendResponse(res, response.build('SUCCESS', {result: userData}));
    } catch(error) { 
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', {error: error}));
    }
}
/* ********************************************************************************
* Function Name   : updateProfile
* For             : APP and Web
* Purposes        : This function is used to give feedback to worker
* Creation Date   : 04-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.updateProfile = async function (req, res){
    try {
        const userId = req.user.userId;
        const { firstName, lastName, email, professionId, specialtieId, currentIp, currentDate } = req.body;
        if(!userId || !isValidObjectId(userId)) {
            return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
        }
        let userData = await userService.getUserById(userId);
        if(!userData) {
            return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
        }
        const data = {
            ...(firstName ? { firstName: firstName } : null),
            ...(lastName ? { lastName: lastName } : null),
            ...(email ? { email: email } : null),
            ...(professionId ? { professionId: professionId } : null),
            ...(specialtieId ? { specialtieId: specialtieId } : null),
            updateDate: currentDate || new Date(),
            updateIp: currentIp || "127.0.0.1"
          };
          
        const updateUserOption = {
            condition: {_id: userId},
            data: data
        };
        const updateUserResult = await userService.updateData(updateUserOption);
        updateUserResult.password  = "";
        updateUserResult.token  = "";
        return response.sendResponse(res, response.build('SUCCESS', {result: updateUserResult._doc}));
    } catch (error) {
        writeLogErrorTrace(['[users update]', '[controller] Error: ', error]);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', {error: error}));
    }
}
/* ********************************************************************************
* Function Name   : changePassword
* For             : APP and Web
* Purposes        : This function is used to give feedback to worker
* Creation Date   : 04-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.changePassword = async function (req, res){
    try {
        const userId = req.user.userId;
        const { password } = req.body;
        let updateUserResult = {};
        if(!userId || !isValidObjectId(userId)) {
            return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
        }
        let userData = await userService.getUserById(userId);
        if(!userData) {
            return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
        }
        if(password){
            const hashPassword = sha256(password.toString());
            const data = {
                ...{ password: hashPassword }
            };
            const updateUserOption = {
                condition: {_id: userId},
                data: data
            };
            updateUserResult = await userService.updateData(updateUserOption);
        } else {
            updateUserResult = userData;
        }
        updateUserResult.password  = "";
        updateUserResult.token  = "";
        return response.sendResponse(res, response.build('SUCCESS', {result: updateUserResult._doc}));
    } catch (error) {
        writeLogErrorTrace(['[users update]', '[controller] Error: ', error]);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', {error: error}));
    }
}
/* ********************************************************************************
* Function Name   : logout
* For             : APP and Web
* Purposes        : This function is used to give feedback to worker
* Creation Date   : 04-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.logout = async function(req,res) {
    try{
        const userId = req.user.userId;
        if(!userId || !isValidObjectId(userId)) {
            return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
        }
        const result = await userCache.invalidate(userId);
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
* Function Name   : notification
* For             : APP and Web
* Purposes        : This function is used to show all notification
* Creation Date   : 11-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.notification = async function (req, res) {
  try {
    const { key } = req.headers;
    const options = {}; // Define the options object here or provide it from somewhere else
    const data = await userService.getNotificationData(options);
    return response.sendResponse(res, response.build('SUCCESS', { result: data }));
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
}
/* ********************************************************************************
* Function Name   : notification_add
* For             : APP and Web
* Purposes        : This function is used to add notification
* Creation Date   : 11-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.notification_add = async function (req, res) {
  try {
    const { key } = req.headers;
    const { title, text, image, latitude, longitude, device_id, platform } = req.body;
    if(!title){
      return response.sendResponse(res, response.build('TITLE_EMPTY', {}));
    }else if(!text){
      return response.sendResponse(res, response.build('TEXT_EMPTY', {}));
    }else if (!req.files || !req.files.image || req.files.image.length === 0) {
      return response.sendResponse(res, response.build('IMAGE_EMPTY', {}));
    }else{
      const addData = {
        title: title,
        text: text,
        ...(req.files.image[0].path ? {image: req.files.image[0].path} : null),
        creationDate: new Date(),
        status: "A",
      };
    const data = await userService.createNotification(addData);
    return response.sendResponse(res, response.build('SUCCESS', { result: data }));
    }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
}
/* ********************************************************************************
* Function Name   : getServiceProviderList
* For             : APP and Web
* Purposes        : This function is used to show all user
* Creation Date   : 24-07-2023
* Created By      : Afsar Ali 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.getServiceProviderList = async function (req, res) {
  try {
    const { service_id } =req.body;
    let serviceProviderList = [];
    let serviceWhere = {
      condition: { status: "A", _id: service_id }
    };
    //Get All Service
    let services = await providerService.getServiceDataById1(serviceWhere); 
    if(services && services[0].sub_services && services[0].sub_services.length > 0){
      await Promise.all(services[0].sub_services.map(async item => {
        
        let where = {
          condition : { "serviceData" : item.service_oid, user_type: { $ne: "Worker" }, "subServices" : item._id }
        }
        await providerService.getproviderSubServices(where)
        .then( async providerData => {
          let finalProviderList = [];
          await Promise.all(providerData.map(async value =>{
            let providerListWhere = {
              condition: { status: "A", userType: { $ne: "Worker" }, _id: value.individual?value.individual:value.company },
              select: {
                fullName: true,
                profile_pic: true,
                phone: true,
                status: true,
                userType: true,
                serviceData : true,
                country : true,
                state : true,
                city : true,
                land_mark: true,
                postal_code : true,
                address1 : true,
                address2 : true
              }
            };      
            await providerService.getData(providerListWhere)
            .then(data => {
              if(data && data.length > 0){
                finalProviderList.push(data[0]);
              }
            })
          }))
          let addData = { 
            _id : item._id,
            serviceName : item.sub_service_name,
            providerList : finalProviderList
          }
          serviceProviderList.push(addData);
        });
        
      }));

      //Most Popular Services for Web updated on 23-08-23
      const popularServiceCondition = {
        condition : { status : "A", popular : "Yes" },
        sort        : {"order_seq": -1},
        select : { service_image : true, icon : true, service_name : true,featured_img : true, popular :true }
      }
      let popularService = await AllService.getData(popularServiceCondition);
      //END

      
      return response.sendResponse(res, response.build('SUCCESS', { result: serviceProviderList.reverse(), popularService : popularService }));
    } else{
      return response.sendResponse(res, response.build('SUCCESS', { result: [] }));
    }
  } catch (error) {
    console.error('[workers registration]', '[controller] Error:', error);
    writeLogErrorTrace(['[workers registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
}; //End of Function
/* ********************************************************************************
* Function Name   : getServiceProviderByID
* For             : APP and Web
* Purposes        : This function is used to show all user
* Creation Date   : 25-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.getServiceProviderByID = async function (req, res) {
  try {
    const { provider_id,service_id } = req.body;
    if(!provider_id || !isValidObjectId(provider_id)){
      return response.sendResponse(res, response.build('PROVIDER_EMPTY', { }));
    }else{
      const where = {
        condition : { _id : provider_id },
        select : {
          fullName    : true,
          phone       : true,
          land_mark   : true,
          profile_pic : true,
          userType    : true
        }
      } 
      let providerData = await providerService.getDataById(where);
      // console.log(providerData);
      if(!providerData || providerData.userType === USERTYPE.WORKER){
        return response.sendResponse(res, response.build('WRONG_PROVIDER_ID', { }));
      }

      let condition =[];
      if(providerData.userType === USERTYPE.INDIVIDUAL){
        condition =  { status: "A", individual : provider_id }
      }else{
          condition = { status: "A", company: provider_id }
      }

      let serviceWhere = {
        condition: condition
      };

      let serviceData = await providerService.fetchAllIndividualServices(serviceWhere);
      
      let subServiceData = await providerService.getIndividualServicesList(serviceWhere);

      //Service Galery
      const galleryWhere ={
        condition : { 
          c_id : provider_id, 
          ...(service_id ? { service_id : service_id } : null)  
        },
        select : {
          before_work_pic : true,
          after_work_pic : true
        },
        sort : { creationDate : -1 }
      }
 
      let workGallery = await providerService.getGallaryDataById(galleryWhere); 

      const feedbackWhere = {
        condition : { worker_id : provider_id }
      }
      let feedback = await providerService.getfeedbackData(feedbackWhere);

      const result = {
        providerData    : providerData,
        serviceData     : serviceData,
        subServiceData  : subServiceData,
        workGallery     : workGallery,
        feedbackData    : feedback
      }
      return response.sendResponse(res, response.build('SUCCESS', { result: result }));
    }
  } catch (error) {
    console.error('[workers registration]', '[controller] Error:', error);
    writeLogErrorTrace(['[workers registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};
/* ********************************************************************************
* Function Name   : removeAddress
* For             : APP and Web
* Purposes        : This function is used to remove user address
* Creation Date   : 28-07-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.removeAddress = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { addressId } = req.body;
    console.log(addressId);
    if(!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    } else if(!addressId){
      return response.sendResponse(res, response.build('ADDRESS_ID_EMPTY', {}));
    } else {
      const where = { condition : { "_id": addressId, "user_id" : userId } }
      await userService.removeAdddresbyID(where);
      return response.sendResponse(res, response.build('SUCCESS', { result: {"message" : "Address deleted successfully."} }));
    }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};
/* ********************************************************************************
* Function Name   : setDefaultAddress
* For             : APP and Web
* Purposes        : This function is used to set default address
* Creation Date   : 01-08-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.setDefaultAddress = async function (req, res) {
  try {
    const userId = req.user.userId;
      const { addressId } = req.body;
      if(!userId || !isValidObjectId(userId)) {
        return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
      } else if(!addressId || !isValidObjectId(addressId)) {
        return response.sendResponse(res, response.build('ADDRESS_ID_EMPTY', {}));
      } else {
      const where = { condition : { _id : addressId, user_id: userId } }
      const addressData = await userService.getAddressDataById(where);
      if(!addressData){
        return response.sendResponse(res, response.build('ADDRESS_NOT_FOUND', {}));
      }
      const updateData = { defaultAddress : addressId };
      const updateWorkerOption = {
        condition: { _id: userId },
        data: updateData
      };
      const data = await userService.updateData(updateWorkerOption);
      return response.sendResponse(res, response.build('SUCCESS', { result: data }));
    }
  } catch (error) {
      writeLogErrorTrace(['[users address]', '[controller] Error: ', error]);
      return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
} //ENF OF FUNCTION

/* ********************************************************************************
* Function Name   : setDefaultAddress
* For             : APP and Web
* Purposes        : This function is used to set default address
* Creation Date   : 01-08-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.addressDetailbyID = async function (req, res) {
  try {
    const userId = req.user.userId;
      const { addressId } = req.body;
      if(!userId || !isValidObjectId(userId)) {
        return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
      } else if(!addressId || !isValidObjectId(addressId)) {
        return response.sendResponse(res, response.build('ADDRESS_ID_EMPTY', {}));
      } else {
      const where = { condition : { _id : addressId, user_id: userId } }
      const addressData = await userService.getAddressDataById(where);
      if(!addressData){
        return response.sendResponse(res, response.build('SUCCESS', { result: [] }));
      } else {
        return response.sendResponse(res, response.build('SUCCESS', { result: addressData }));
      }
    }
  } catch (error) {
      writeLogErrorTrace(['[users address]', '[controller] Error: ', error]);
      return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
} //ENF OF FUNCTION

exports.eamiTest = async function (req, res){
  try{
    const {email}=req.body;
    const mailData ={
      fullName  : "Amrit",
      email     : email,
     }
     let msg =  await emailService.sendNewUserRegistrationMailToUser(mailData);
     return response.sendResponse(res, response.build('SUCCESS', { result: msg }));
      
  } catch(error){
    console.log(error)
  }
}
