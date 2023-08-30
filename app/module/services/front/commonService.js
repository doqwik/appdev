/********* DATABASE MODELS *********/
const Banners = require('../../../models/banner');
const Pageheadings = require('../../../models/pageheadings');
const Testimonails  = require('../../../models/testimonails');
const Getapp  = require('../../../models/getapp');
const Termscondition  = require('../../../models/termcondition');
const Privacypolicy  = require('../../../models/privacypolicy');
const Reason  = require('../../../models/reason');
const Subscribe = require('../../../models/Newsletter');
const features = require('../../../models/exclusive_feature');
const Services  = require('../../../models/services');
const SubServices  = require('../../../models/sub_services');

const Contactus  = require('../../../models/contactus');

const SMS_Log = require('../../../models/smsLog');
const Email_Log = require('../../../models/emailLog');

const Country = require('../../../models/country');
const State = require('../../../models/state');
const City = require('../../../models/city');

/************ END *****************/
const {
  userAuthIssuerName,
  roles: { USER },
  authTokenUserAuthExpiresIn,
} = require("../../../config/constant");




exports.createserviceData = async function(userParam) {
  try {
    return await Services.create(userParam);
  } catch (error) {
    return Promise.reject(error);
  }
}
/*******************************************
 ****** GET PAGE Terms & Condition DATA *****
 *******************************************/
 exports.getPageprivacyData = async function (options,type) {
    try {
      const { condition={}, sort={},skip,limit } = options;
      if(type == 'count'){
        return await Privacypolicy.find(condition).count();
      } else {
        return await Privacypolicy.find(condition).sort(sort).skip(skip).limit(limit);
      }
    } catch (error) {
      return Promise.reject(error);
    }
  } //END OF FUNCTION
  /*******************************************
 ****** GET PAGE Terms & Condition DATA *****
 *******************************************/
 exports.getappHeadingsData = async function (options,type) {
    try {
      const { condition={}, sort={},skip,limit } = options;
      if(type == 'count'){
        return await Getapp.find(condition).count();
      } else {
        return await Getapp.find(condition).sort(sort).skip(skip).limit(limit);
      }
    } catch (error) {
      return Promise.reject(error);
    }
  } //END OF FUNCTION

  /*******************************************
 ****** GET PAGE Terms & Condition DATA *****
 *******************************************/
 exports.getPagetermsconditionData = async function (options,type) {
    try {
      const { condition={}, sort={},skip,limit } = options;
      if(type == 'count'){
        return await Termscondition.find(condition).count();
      } else {
        return await Termscondition.find(condition).sort(sort).skip(skip).limit(limit);
      }
    } catch (error) {
      return Promise.reject(error);
    }
  } //END OF FUNCTION
/*******************************************
 ********** GET BANNER DEAILS DATA *********
 *******************************************/
exports.getBannerData = async function (options,type) {
  try {
    const { condition={}, sort={},skip,limit } = options;
    if(type == 'count'){
      return await Banners.find(condition).count();
    } else {
      return await Banners.find(condition).sort(sort).skip(skip).limit(limit);
    }
  } catch (error) {
    return Promise.reject(error);
  }
} //END OF FUNCTION
//Get Reson Data
exports.getResonDataCondition = async function (options,type) {
  try {
    const { condition={}, sort={},skip,limit } = options;
    if(type == 'count'){
      return await Reason.find(condition).count();
    } else {
      return await Reason.find(condition).sort(sort).skip(skip).limit(limit);
    }
  } catch (error) {
    return Promise.reject(error);
  }
} //END OF FUNCTION

/*******************************************
 ****** GET PAGE HEADINGS  DEAILS DATA *****
 *******************************************/
 exports.getPageHeadingsData = async function (options,type) {
    try {
      const { condition={}, sort={},skip,limit } = options;
      if(type == 'count'){
        return await Pageheadings.find(condition).count();
      } else {
        return await Pageheadings.find(condition).sort(sort).skip(skip).limit(limit);
      }
    } catch (error) {
      return Promise.reject(error);
    }
  } //END OF FUNCTION

/*******************************************
 ****** GET TESTIMINIAL DEAILS DATA *****
 *******************************************/
 exports.getTestimonailsHeadingsData = async function (options,type) {
  try {
    const { condition={}, sort={},skip,limit } = options;
    if(type == 'count'){
      return await Testimonails.find(condition).count();
    } else {
      return await Testimonails.find(condition).sort(sort).skip(skip).limit(limit);
    }
  } catch (error) {
    return Promise.reject(error);
  }
} //END OF FUNCTION
/*******************************************
 ********** SUBSCRIBE NEWALATTER ***********
 *******************************************/
 exports.subscribeNewsletter = async function (data) {
  try {
    return await Subscribe.create(data);
  } catch (error) {
    return Promise.reject(error);
  }
} //END OF FUNCTION
/*******************************************
 ******* GET NEWALATTER SUBSCRIBER  ********
 *******************************************/
 exports.getSubscriber = async function (options) {
  try {
    const { condition={}, sort={},skip,limit } = options;    
    return await Subscribe.find(condition).count();
  } catch (error) {
    return Promise.reject(error);
  }
} //END OF FUNCTION

/*******************************************
 ******* GET Exclusive features  ********
 *******************************************/
 exports.getfeatures = async function (options) {
  try {
    const { condition={}, sort={},skip,limit } = options;    
    return await features.find(condition).sort(sort);
  } catch (error) {
    return Promise.reject(error);
  }
} //END OF FUNCTION




/*******************************************
 ******* GET All Service  ********
 *******************************************/
 const { ObjectId } = require('mongoose').Types;

 exports.getServiceData = async function (options, type) {
  try {
    const { condition = {}, sort = {}, skip, limit } = options;

    return await Services.find(condition).sort(sort).skip(skip).limit(limit).populate('sub_services');

    // const serviceData = [];
    // for (const service of services) {
    //   const subServiceIds = service.sub_services.map(subServiceId => ObjectId(subServiceId));
    //   const subServices = await SubServices.find({ _id: { $in: subServiceIds } });
    //   const matchingSubServices = subServices.filter(subService => subService.service_id.toString() === service.service_id.toString());

    //   serviceData.push({
    //     service: service.toObject(),
    //     subServices: matchingSubServices.map(subService => subService.toObject())
    //   });
    // }

    // return serviceData;
  } catch (error) {
    return Promise.reject(error);
  }
};

/*******************************************
 *********** Create Countact us  **********
 *******************************************/
 exports.createContactus = async function (params) {
  try {
    return await Contactus.create(params);
  } catch (error) {
    return Promise.reject(error);
  }
};

/*******************************************
 ************ Create SMS logs **************
 *******************************************/
 exports.createSMSLog = async function(param) {
  try {
    return await SMS_Log.create(param);
  } catch (error) {
    return Promise.reject(error);
  }
}
/*******************************************
 ****** GET PAGE Terms & Condition DATA *****
 *******************************************/
 exports.createEmailLog = async function(param) {
  try {
    return await Email_Log.create(param);
  } catch (error) {
    return Promise.reject(error);
  }
}
/*******************************************
 ****** GET All Country by condition ******
 *******************************************/
exports.getCountry = async function(options){
  try {
    const { condition={} } = options;
    return await Country.find(condition);
  } catch (error) {
    return Promise.reject(error);
  }
} //End of Function
/*******************************************
 ****** GET All State by condition ******
 *******************************************/
 exports.getState = async function(options){
  try {
    const { condition={} } = options;
    return await State.find(condition);
  } catch (error) {
    return Promise.reject(error);
  }
} //End of Function
/*******************************************
 ****** GET All City by condition ******
 *******************************************/
 exports.getCIty = async function(options){
  try {
    const { condition={} } = options;
    return await City.find(condition);
  } catch (error) {
    return Promise.reject(error);
  }
} //End of Function