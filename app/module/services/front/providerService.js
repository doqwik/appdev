const User = require('../../../models/users');
const Provider = require('../../../models/provider');
const providerServices = require('../../../models/providerServices');
const providerSubServices = require('../../../models/providerSubServices');

const Feedback = require('../../../models/feedback');
const Services = require('../../../models/services');
const ServicesGallary = require('../../../models/services_gallary');
const OtpGeneration = require("../../../util/otpGeneration");
const OtpVerification = require("../../../util/otpVerification");
const AuthToken = require("../../../util/authToken");
const providerCache = require("../../../util/providerCache");
const SubServices = require('../../../models/sub_services');
const mongoose = require("mongoose");
const {
  userAuthIssuerName,
  roles: { USER },
  authTokenUserAuthExpiresIn,
} = require("../../../config/constant");

const {
  providerAuthIssuerName,
  roles: { PROVIDER },
  authTokenProviderAuthExpiresIn,
} = require("../../../config/constant");
exports.getsubServicesFromProvider = async function (options, type) {
  try {
    const { condition={}, sort={},skip,limit } = options;
    if(type == 'count'){
      return await SubServices.find(condition).count();
    } else {
      return await SubServices.find(condition).sort(sort).skip(skip).limit(limit);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}
//End
exports.getGallary = async function (options, type) {
  try {
    const { condition={}, sort={},skip,limit } = options;
    if(type == 'count'){
      return await ServicesGallary.find(condition).count();
    } else {
      return await ServicesGallary.find(condition).sort(sort).skip(skip).limit(limit);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}
exports.getData = async function (options,type) {
  try {
    const { condition={}, sort={},select={},skip,limit } = options;
    if(type == 'count'){
      return await Provider.find(condition).count();
    } else {
      return await Provider.find(condition).select(select).sort(sort).skip(skip).limit(limit);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}
exports.getServiceData = async function (options,type) {
  try {
    const { condition={}, sort={},skip,limit } = options;
    if(type == 'count'){
      return await providerServices.find(condition).count();
    } else {
      return await providerServices.find(condition).sort(sort).skip(skip).limit(limit);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}
exports.getworkerdetailData = async function(options) {
  try {
    const { condition={} } = options;
    return await providerServices.find(condition);
  } catch (error) {
    return Promise.reject(error);
  }
}
exports.getworkerdetail = async function (options,type) {
  try {
    const { condition={}, sort={},skip,limit } = options;
    if(type == 'count'){
      return await providerServices.find(condition).count();
    } else {
      return await providerServices.find(condition).sort(sort).skip(skip).limit(limit);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.getworkgallaryDataById = async function (options) {
  try {
    const { condition={} } = options;
    return await ServicesGallary.find(condition);
  } catch (error) {
    return Promise.reject(error);
  }
}
exports.getDataById = async function (options) {
  try {
    const { condition={}, select={} } = options;
    return await Provider.findOne(condition).select(select);
  } catch (error) {
    return Promise.reject(error);
  }
}
exports.getDataById1 = async function (options) {
  try {
    const { condition={} } = options;
    return await Provider.find(condition);
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.getServiceDataById = async function (options) {
  try {
    const { condition={} } = options;
    return await Services.findOne(condition);
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.getServiceDataById1 = async function (options) {
  try {
    const { condition={} } = options;
    return await Services.find(condition).populate('sub_services');
  } catch (error) {
    return Promise.reject(error);
  }
}
exports.getWorkerDataById = async function (options) {
  try {
    const { condition={} } = options;
    return await Provider.find(condition);
  } catch (error) {
    return Promise.reject(error);
  }
}
exports.getWorkerDataById1 = async function (options) {
  try {
    const { condition = {} } = options;

    const [providerData, userData] = await Promise.all([
      Provider.find(condition),
      User.find(condition)
    ]);

    const mergedData = [...providerData, ...userData];

    return mergedData;
  } catch (error) {
    return Promise.reject(error);
  }
};

exports.getUserDataById = async function (options) {
  try {
    const { condition={} } = options;
    return await User.find(condition);
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.getWorkerDataBywoekerId = async function (options) {
  try {
    const { condition={} } = options;
    return await providerServices.find(condition);
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.createData = async function(userParam) {
  try {
    //return await User.create(userData);
    const userData = await Provider.create(userParam);
    if(userData){
      // generate auth token
      const token = await AuthToken.generateToken(
        userData._id,
        PROVIDER,
        providerAuthIssuerName,
        authTokenProviderAuthExpiresIn
      );
      await providerCache.invalidate(userData._id);
      await providerCache.setToken(userData._id, token);
      await Provider.findOneAndUpdate({_id:userData._id}, {token:token});
      
      return await Provider.findById(userData._id);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.createDataWithoutToken = async function(userParam) {
  try {
    return await Provider.create(userParam);
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.updateData = function(options) {
  return new Promise((resolve, reject) => {
    const { condition = {}, data } = options;
    Provider.findOneAndUpdate(condition, data,{new:true})
      .then(updatedData => resolve(updatedData))
      .catch(error => reject(error));
  });
};

exports.updateWorkerList = function(options) {
  return new Promise((resolve, reject) => {
    const { condition = {}, pull } = options;
    Provider.findOneAndUpdate(condition, pull)
      .then(updatedData => resolve(updatedData))
      .catch(error => reject(error));
  });
};


exports.deleteData = async function (options) {
  const { condition={} } = options;
  try {
    return await Provider.deleteOne(condition);
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.getUserLogin = async function (options) {
  try {
    const { condition={}, device_id } = options;   
    const userData = await Provider.findOne(condition);
    // console.log(userData);
    if(userData){
      // generate auth token
      const token = await AuthToken.generateToken(
        userData._id,
        PROVIDER,
        providerAuthIssuerName,
        authTokenProviderAuthExpiresIn
      );


      await providerCache.invalidate(userData._id);
      await providerCache.setToken(userData._id, token);
      
      await Provider.findOneAndUpdate({_id:userData._id}, { token : token, ...(device_id?{device_id:device_id}:null)});
      return await Provider.findById(userData._id);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.getUserById = async function (id) {
  try {
    return await Provider.findById(id);
  } catch (error) {
    return Promise.reject(error);
  }
}
/////////////// Provider Services /////////////////////////
//Add services in provider
exports.addServicesToProvider = async function (data) {
  // const { condition={}, data } = options;
  try {
    return (await providerServices.create(data)).populate("provider services subServices subServicesList._id");
  } catch (error) {
    return Promise.reject(error);
  }
}
//End

//Get services of worker
exports.getServicesFromProvider = async function (options, type) {
  try {
    const { condition={}, sort={},skip,limit } = options;
    if(type == 'count'){
      return await providerServices.find(condition).count();
    } else {
      return await providerServices.find(condition).sort(sort).skip(skip).limit(limit);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}
//End
exports.getGallary = async function (options, type) {
  try {
    const { condition={}, sort={},skip,limit } = options;
    if(type == 'count'){
      return await ServicesGallary.find(condition).count();
    } else {
      return await ServicesGallary.find(condition).sort(sort).skip(skip).limit(limit);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}
//Get single services of worker
exports.getSingleServicesToProvider = async function (options) {
  try {
    const { condition={}, sort={},skip,limit } = options;
    return await providerServices.findOne(condition).sort(sort).skip(skip).limit(limit);
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.getSingleworkgallary = async function (options) {
  try {
    const { condition={}, sort={},skip,limit } = options;
    return await ServicesGallary.findOne(condition).sort(sort).skip(skip).limit(limit);
  } catch (error) {
    return Promise.reject(error);
  }
}
//End

exports.updateProviderServocesData = async function (options) {
  const { condition={}, data } = options;
  try {
    // console.log(data);
    return await providerServices.findOneAndUpdate(condition, data).populate("subServices");
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.createWorkGallayData = async function(userParam) {
  try {
    //return await User.create(userData);
    return await ServicesGallary.create(userParam);
  } catch (error) {
    return Promise.reject(error);
  }
}


exports.updateWorkGallaryData = async function (options, data) {
  const { condition={} } = options;
  try {
    return await ServicesGallary.findOneAndUpdate(condition, data, {new: true});
  } catch (error) {
    return Promise.reject(error);
  }
}
exports.getGallaryDataById = async function (options) {
  try {
    const { condition={},select={},sort={} } = options;
    return await ServicesGallary.find(condition).select(select).sort(sort);
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.updateFeedbackData = async function (options, data) {
  const { condition={} } = options;
  try {
    return await Feedback.findOneAndUpdate(condition, data, {new: true});
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.getfeedbackData = async function (options) {
  try {
    const { condition={} } = options;
    return await Feedback.find(condition);
  } catch (error) {
    return Promise.reject(error);
  }
}

 
exports.updatefeedbackData = async function (options, data) {
  const { condition } = options;
  try {
    return await Feedback.findOneAndUpdate(condition, data, { new: true });
  } catch (error) {
    return Promise.reject(error);
  }
}

exports.getFeedbackDataById = async function (options) {
  try {
    const { condition={} } = options;
    return await Feedback.find(condition);
  } catch (error) {
    return Promise.reject(error);
  }
}


//Add services in provider
exports.fetchIndividualServices = async function (options) {
  const { condition={}, data } = options;
  try {
    return await providerServices.findOne(condition).populate("serviceData","_id service_name status");
  } catch (error) {
    return Promise.reject(error);
  }
}
//End

//Show All services in provider
exports.fetchAllIndividualServices = async function (options) {
  const { condition={} } = options;
  try {
    return await providerServices.find(condition).populate("serviceData","_id service_name service_image icon isCategory");
  } catch (error) {
    return Promise.reject(error);
  }
}
//End

//Add services
exports.addServices = function (data) {
  return new Promise((resolve, reject) => {
    providerServices.create(data)
      .then(result => {
        resolve(result); // Resolve the Promise with the result
      })
      .catch(error => {
        reject(error); // Reject the Promise with the error
      });
  });
};

//End

//Add sub services
exports.addSubservices = async function(param) {
  return new Promise((resolve, reject) => {
    providerSubServices.create(param)
    .then(result => {
      resolve(result); // Resolve the Promise with the result
    })
    .catch(error => {
      reject(error); // Reject the Promise with the error
    });
  })
} //End of function

//Find One sub services
exports.findOneSubservices = async function(options) {
  const { condition={} } = options;
  try {
    return await providerSubServices.findOne(condition);
  } catch (error) {
    return Promise.reject(error)
  }
} //End of function

//Find one and Update
exports.updateSubSrvices = function (options) {
  return new Promise((resolve, reject) => {
    const { condition = {}, data } = options;
    providerSubServices.findOneAndUpdate(condition, data, { new: true })
      .then(updatedDocument => {
        resolve(updatedDocument); // Resolve the Promise with the updated document
      })
      .catch(error => {
        reject(error);
      });
  });
};

//Get services of worker
exports.getproviderSubServices = async function (options, type) {
  try {
    const { condition={}, sort={},skip,limit } = options;
    if(type == 'count'){
      return await providerSubServices.find(condition).count();
    } else {
      return await providerSubServices.find(condition).sort(sort).skip(skip).limit(limit).populate("subServices");
    }
  } catch (error) {
    return Promise.reject(error);
  }
}
//End 

//Get services of worker
exports.getIndividualServicesList = async function (options, type) {
  try {
    const { condition={}, sort={},skip,limit } = options;
    if(type == 'count'){
      return await providerSubServices.find(condition).count();
    } else {
      return await providerSubServices.find(condition).sort(sort).skip(skip).limit(limit).populate('serviceData subServices','service_name service_image icon sub_service_image, sub_service_icon sub_service_name isCategory');
    }
  } catch (error) {
    return Promise.reject(error);
  }
}
//End 
//Get services of worker
exports.getOnlyOneIndividualServices = async function (options) {
  try {
    const { condition={}, sort={},skip,limit } = options;
    return await providerSubServices.findOne(condition).select('serviceData subServices price category creationDate status').sort(sort).skip(skip).limit(limit).populate('serviceData subServices','service_name service_image revenue icon sub_service_image, sub_service_icon sub_service_name isCategory');
  } catch (error) {
    return Promise.reject(error);
  }
}
//End
//delete services 
exports.deleteIndividualServices = async function (options) {
  const { condition={} } = options;
  try {
    return await providerSubServices.deleteOne(condition);
  } catch (error) {
    return Promise.reject(error);
  }
}//End of Function

//Provider List by service id
exports.getProviderList =async function(options){
  const { condition={},sort={},select={},skip,limit }=options
  try {
    return await providerServices.find(condition).select(select).skip(skip).limit(limit).populate('individual company serviceData serviceData.sub_services','fullName country state city address1 address2 land_mark postal_code status profile_pic phone email service_name tags isCategory sub_service_name sub_services');
  } catch (error) {
    return Promise.reject(error);
  }
}//End of Funciton

//worker service detail for APP
exports.serviceList = async function (options){
  const{ condition={}, select={},sort={},skip,limit } = options
  try{
    return await providerServices.find(condition).sort(sort).select(select).skip(skip).limit(limit).populate('serviceData', 'service_image icon service_name');
  } catch (error){
    return Promise.reject(error)
  }
}

//worker sub service detail for APP
exports.subServiceList = async function (options){
  const{ condition={}, select={},short={},skip,limit } = options
  try{
    return await providerSubServices.find(condition).sort(short).select(select).skip(skip).limit(limit).populate('serviceData subServices', 'service_image icon service_name sub_service_name sub_service_icon sub_service_image');
  } catch (error){
    return Promise.reject(error)
  }
}

//Company worker list bu service 
exports.companyWorkerListbyService = async function (options){
  const{ condition={}, select={},short={},skip,limit } = options
  try{
    return await providerServices.find(condition).sort(short).select(select).skip(skip).limit(limit).populate('worker', 'fullName userType profile_pic address1 address2 country state city land_mark postal_code phone');
  } catch (error){
    return Promise.reject(error)
  }
}